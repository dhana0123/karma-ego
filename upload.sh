#!/bin/bash
# upload.sh — Upload vendor data to HF
# Usage: ./upload.sh VisionLabs

VENDOR=$1
REPO="karma-ego/global"

if [ -z "$VENDOR" ]; then
    echo "Usage: ./upload.sh <vendor_name>"
    echo "Example: ./upload.sh VisionLabs"
    exit 1
fi

# Enable fast transfer
export HF_HUB_ENABLE_HF_TRANSFER=1

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  KARMA-EGO UPLOAD"
echo "  Vendor: $VENDOR"
echo "  Repo:   $REPO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check vendor folder exists
if [ ! -d "./videos/vendor_$VENDOR" ]; then
    echo "❌ Folder not found: ./videos/vendor_$VENDOR"
    exit 1
fi

# Check de-identification
echo ""
echo "⚠️  Confirm before uploading:"
read -p "   Are all videos de-identified? (yes/no): " DEID
if [ "$DEID" != "yes" ]; then
    echo "❌ Upload cancelled. Run deidentify.py first."
    exit 1
fi

read -p "   Is metadata complete? (yes/no): " META
if [ "$META" != "yes" ]; then
    echo "❌ Upload cancelled. Complete metadata first."
    exit 1
fi

# Step 1 — Upload videos
echo ""
echo "Step 1/3 — Uploading videos..."
huggingface-cli upload "$REPO" \
    "./videos/vendor_$VENDOR" \
    "videos/vendor_$VENDOR/" \
    --repo-type dataset \
    --commit-message "Add vendor $VENDOR videos $(date +%Y-%m-%d)"

if [ $? -ne 0 ]; then
    echo "❌ Video upload failed"
    exit 1
fi
echo "✅ Videos uploaded"

# Step 2 — Upload vendor metadata
echo ""
echo "Step 2/3 — Uploading vendor metadata..."
huggingface-cli upload "$REPO" \
    "./metadata/${VENDOR}_metadata.csv" \
    "metadata/${VENDOR}_metadata.csv" \
    --repo-type dataset \
    --commit-message "Add ${VENDOR} metadata"
echo "✅ Vendor metadata uploaded"

# Step 3 — Upload global metadata
echo ""
echo "Step 3/3 — Uploading global metadata..."
huggingface-cli upload "$REPO" \
    "./metadata/global_metadata.csv" \
    "metadata/global_metadata.csv" \
    --repo-type dataset \
    --commit-message "Update global metadata for $VENDOR"
echo "✅ Global metadata uploaded"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ UPLOAD COMPLETE"
echo "   Vendor $VENDOR is now live on HF"
echo "   https://huggingface.co/datasets/$REPO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Optional: tag version
read -p "Tag a version? (e.g. v1.0 or skip): " TAG
if [ -n "$TAG" ] && [ "$TAG" != "skip" ]; then
    python3 -c "
from huggingface_hub import HfApi
HfApi().create_tag('$REPO', repo_type='dataset', tag='$TAG', tag_message='Release $TAG — added $VENDOR')
print('✅ Tagged $TAG')
"
fi