#!/bin/bash
# health-check.sh — Validates green deployment before traffic switch

NAMESPACE="default"
SLOT=${1:-green}
MAX_RETRIES=10
RETRY_INTERVAL=15

echo "================================================"
echo " Health Check Script — Blue-Green Deployment"
echo "================================================"
echo "Slot    : $SLOT"
echo "Retries : $MAX_RETRIES"
echo "Interval: ${RETRY_INTERVAL}s"
echo "================================================"

for i in $(seq 1 $MAX_RETRIES); do
    echo ""
    echo "Attempt $i / $MAX_RETRIES..."

    # Get a running pod from the target slot
    POD=$(kubectl get pods -n $NAMESPACE \
        -l app=demo-app,slot=$SLOT \
        --field-selector=status.phase=Running \
        -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)

    if [ -z "$POD" ]; then
        echo "No running pods found for slot: $SLOT. Retrying in ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
        continue
    fi

    echo "Found pod: $POD"

    # Start port-forwarding in background
    kubectl port-forward $POD 9999:3000 -n $NAMESPACE &
    PF_PID=$!
    sleep 3

    # Make health check request
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time 5 http://localhost:9999/health)

    RESPONSE=$(curl -s --max-time 5 http://localhost:9999/health)

    # Kill port-forwarder
    kill $PF_PID 2>/dev/null
    wait $PF_PID 2>/dev/null

    echo "HTTP Status : $HTTP_STATUS"
    echo "Response    : $RESPONSE"

    if [ "$HTTP_STATUS" = "200" ]; then
        COLOR=$(echo $RESPONSE | python3 -c \
            "import sys,json; print(json.load(sys.stdin).get('color','unknown'))")
        VERSION=$(echo $RESPONSE | python3 -c \
            "import sys,json; print(json.load(sys.stdin).get('version','unknown'))")
        echo ""
        echo "================================================"
        echo " Health Check PASSED!"
        echo " Slot   : $COLOR"
        echo " Version: $VERSION"
        echo " Status : Healthy and ready for traffic switch"
        echo "================================================"
        exit 0
    fi

    echo "Health check failed. Retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

echo ""
echo "================================================"
echo " HEALTH CHECK FAILED after $MAX_RETRIES attempts!"
echo " Green is NOT ready. Keeping Blue live."
echo "================================================"
exit 1