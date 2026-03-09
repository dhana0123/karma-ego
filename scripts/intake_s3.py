"""
intake.py - Stream videos from S3 bucket directly to HuggingFace
No local disk space needed.

Usage:
    python intake.py --vendor Bellu --bucket their-bucket --folder bellu-videos/ --country India --device GoPro

Install: pip install boto3 mutagen huggingface_hub
"""

import os
import csv
import uuid
import argparse
from datetime import datetime
from huggingface_hub import HfApi

# Change to your HF username
REPO_ID = "Karma-ego/global"

# AWS credentials from vendor
AWS_ACCESS_KEY = ""
AWS_SECRET_KEY = ""
AWS_REGION     = "us-east-1"  # change if different



def get_duration_from_stream(s3_client, bucket, key):
    """Read just the header of the S3 file to get duration."""
    try:
        from mutagen.mp4 import MP4
        import io
        # Download first 64KB only
        response = s3_client.get_object(
            Bucket=bucket,
            Key=key,
            Range="bytes=0-65535"
        )
        data  = response["Body"].read()
        audio = MP4(io.BytesIO(data))
        return round(audio.info.length, 2)
    except:
        return None


def intake(vendor, bucket, folder, country, device):

    import boto3

    metadata_csv = "./metadata/global_metadata.csv"
    os.makedirs("./metadata", exist_ok=True)

    # Connect to S3
    s3 = boto3.client(
        "s3",
        aws_access_key_id     = AWS_ACCESS_KEY,
        aws_secret_access_key = AWS_SECRET_KEY,
        region_name           = AWS_REGION
    )

    api = HfApi()

    meta_fields = [
        "video_uid", "vendor", "original_filename",
        "country", "device", "duration_sec",
        "coarse_task", "fine_task",
        "intake_date", "license", "file_name"
    ]

    # Load existing metadata to avoid duplicates
    meta_rows = []
    existing  = set()

    if os.path.exists(metadata_csv):
        with open(metadata_csv) as f:
            reader    = csv.DictReader(f)
            meta_rows = list(reader)
            existing  = {r["original_filename"] for r in meta_rows}

    # List all video files in S3 folder
    print(f"Reading S3 bucket: {bucket}/{folder}")
    paginator = s3.get_paginator("list_objects_v2")
    pages     = paginator.paginate(Bucket=bucket, Prefix=folder)

    files = []
    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if key.lower().endswith((".mp4", ".mov", ".avi", ".mkv")):
                filename = os.path.basename(key)
                files.append((filename, key))

    if not files:
        print("No video files found in S3 folder.")
        return

    print(f"Found {len(files)} videos from {vendor}\n")

    new_rows  = []
    total_sec = 0

    for i, (original, key) in enumerate(files, 1):

        # Skip already processed
        if original in existing:
            print(f"  [{i}/{len(files)}] Skipping {original} - already processed")
            continue

        vid_uuid = str(uuid.uuid4())
        new_name = f"{vid_uuid}.mp4"
        hf_path  = f"videos/vendor_{vendor}/{new_name}"

        print(f"  [{i}/{len(files)}] {original}")

        # Get duration from header only
        duration   = get_duration_from_stream(s3, bucket, key)
        total_sec += duration or 0
        print(f"    Duration : {duration}s")

        # Stream from S3 directly to HF
        print(f"    Uploading to HF...")
        try:
            import io
            response = s3.get_object(Bucket=bucket, Key=key)
            fileobj  = io.BytesIO(response["Body"].read())

            api.upload_file(
                path_or_fileobj = fileobj,
                path_in_repo    = hf_path,
                repo_id         = REPO_ID,
                repo_type       = "dataset",
                commit_message  = f"Add {original}"
            )
            print(f"    Done -> {vid_uuid[:8]}...")
        except Exception as e:
            print(f"    Failed: {e}")
            continue

        new_rows.append({
            "video_uid":         vid_uuid,
            "vendor":            vendor,
            "original_filename": original,
            "country":           country,
            "device":            device,
            "duration_sec":      duration or "",
            "coarse_task":       "",
            "fine_task":         "",
            "intake_date":       datetime.today().strftime("%Y-%m-%d"),
            "license":           "CC-BY-4.0",
            "file_name":         hf_path
        })

    if not new_rows:
        print("No new videos uploaded.")
        return

    # Write global metadata
    all_rows = meta_rows + new_rows
    with open(metadata_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=meta_fields)
        writer.writeheader()
        writer.writerows(all_rows)

    # Upload metadata to HF
    print("\nUploading metadata to HF...")
    api.upload_file(
        path_or_fileobj = metadata_csv,
        path_in_repo    = "metadata/global_metadata.csv",
        repo_id         = REPO_ID,
        repo_type       = "dataset",
        commit_message  = f"Update global metadata for {vendor}"
    )

    total_hrs = total_sec / 3600
    print(f"\nIntake complete - {vendor}")
    print(f"  Videos uploaded : {len(new_rows)}")
    print(f"  Total hours     : {total_hrs:.1f}")
    print(f"  Metadata        : {metadata_csv}")
    print(f"\n  Open {metadata_csv} and fill coarse_task and fine_task columns.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Karma-Ego S3 to HF intake")
    parser.add_argument("--vendor",  required=True, help="Vendor name e.g. Bellu")
    parser.add_argument("--bucket",  required=True, help="S3 bucket name")
    parser.add_argument("--folder",  required=True, help="S3 folder/prefix e.g. bellu-videos/")
    parser.add_argument("--country", default="Unknown", help="Country e.g. India")
    parser.add_argument("--device",  default="Unknown", help="Device e.g. GoPro Hero 11")
    args = parser.parse_args()

    intake(
        vendor  = args.vendor,
        bucket  = args.bucket,
        folder  = args.folder,
        country = args.country,
        device  = args.device
    )