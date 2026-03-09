"""
intake.py - Process vendor videos and generate metadata
Usage: python intake.py --vendor Bellu --input ./incoming/Bellu --country India --device GoPro

Install: pip install mutagen
"""

import os
import csv
import uuid
import shutil
import argparse
from datetime import datetime


def get_duration(path):
    """Get video duration in seconds using mutagen - reads header only, very fast."""
    try:
        from mutagen.mp4 import MP4
        audio = MP4(path)
        return round(audio.info.length, 2)
    except:
        return None


def intake(vendor, input_dir, country, device):

    output_dir   = f"./videos/vendor_{vendor}"
    metadata_csv = "./metadata/global_metadata.csv"

    os.makedirs(output_dir, exist_ok=True)
    os.makedirs("./metadata", exist_ok=True)

    meta_fields = [
        "video_uid", "vendor", "original_filename",
        "country", "device", "duration_sec",
        "coarse_task", "fine_task",
        "intake_date", "license", "file_name"
    ]

    # Load existing global metadata to avoid duplicates
    meta_rows = []
    existing  = set()

    if os.path.exists(metadata_csv):
        with open(metadata_csv) as f:
            reader    = csv.DictReader(f)
            meta_rows = list(reader)
            existing  = {r["original_filename"] for r in meta_rows}

    # Check if vendor included their own metadata.csv
    vendor_meta_path = os.path.join(input_dir, "metadata.csv")
    vendor_meta      = {}

    if os.path.exists(vendor_meta_path):
        print("Vendor metadata.csv found - reading tasks from it")
        with open(vendor_meta_path) as f:
            for row in csv.DictReader(f):
                vendor_meta[row["original_filename"]] = row
    else:
        print("No vendor metadata.csv found - tasks will be blank, fill manually after")

    # Find all videos
    raw_videos = sorted([
        f for f in os.listdir(input_dir)
        if f.lower().endswith((".mp4", ".mov", ".avi", ".mkv"))
    ])

    if not raw_videos:
        print(f"No videos found in {input_dir}")
        return

    print(f"Found {len(raw_videos)} videos from {vendor}")
    print(f"Output folder: {output_dir}\n")

    new_rows  = []
    total_sec = 0

    for i, original in enumerate(raw_videos, 1):

        # Skip already processed
        if original in existing:
            print(f"  Skipping {original} - already processed")
            continue

        src      = os.path.join(input_dir, original)
        vid_uuid = str(uuid.uuid4())
        new_name = f"{vid_uuid}.mp4"
        dst      = os.path.join(output_dir, new_name)
        hf_path  = f"videos/vendor_{vendor}/{new_name}"

        duration   = get_duration(src)
        total_sec += duration or 0

        # Get task from vendor metadata if available
        if original in vendor_meta:
            coarse = vendor_meta[original].get("coarse_task", "")
            fine   = vendor_meta[original].get("fine_task", "")
        else:
            coarse = ""
            fine   = ""

        shutil.copy2(src, dst)

        new_rows.append({
            "video_uid":         vid_uuid,
            "vendor":            vendor,
            "original_filename": original,
            "country":           country,
            "device":            device,
            "duration_sec":      duration or "",
            "coarse_task":       coarse,
            "fine_task":         fine,
            "intake_date":       datetime.today().strftime("%Y-%m-%d"),
            "license":           "CC-BY-4.0",
            "file_name":         hf_path
        })

        print(f"  [{i}/{len(raw_videos)}] {original} -> {vid_uuid[:8]}... ({duration}s)")

    # Write global metadata
    all_rows = meta_rows + new_rows
    with open(metadata_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=meta_fields)
        writer.writeheader()
        writer.writerows(all_rows)

    # Summary
    total_hrs   = total_sec / 3600
    blank_tasks = [r for r in new_rows if r["coarse_task"] == ""]

    print(f"\nIntake complete - {vendor}")
    print(f"  Videos processed : {len(new_rows)}")
    print(f"  Total hours      : {total_hrs:.1f}")
    print(f"  Metadata         : {metadata_csv}")

    if blank_tasks:
        print(f"\n  {len(blank_tasks)} videos have blank tasks.")
        print(f"  Open {metadata_csv} and fill coarse_task and fine_task columns.")

    print(f"\nNext steps:")
    print(f"  1. Fill blank tasks in {metadata_csv}")
    print(f"  2. Run: python upload.py --vendor {vendor}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Karma-Ego vendor intake")
    parser.add_argument("--vendor",  required=True, help="Vendor name e.g. Bellu")
    parser.add_argument("--input",   required=True, help="Folder with vendor videos")
    parser.add_argument("--country", default="Unknown", help="Country e.g. India")
    parser.add_argument("--device",  default="Unknown", help="Device e.g. GoPro Hero 11")
    args = parser.parse_args()

    intake(
        vendor    = args.vendor,
        input_dir = args.input,
        country   = args.country,
        device    = args.device
    )