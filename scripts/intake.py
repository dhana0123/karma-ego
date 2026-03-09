"""
intake.py — Run this when a vendor submits data
Usage: python intake.py --vendor VisionLabs --input ./incoming/VisionLabs
"""

import os
import csv
import uuid
import shutil
import subprocess
import argparse
from datetime import datetime


def get_video_info(path):
    """Extract duration, resolution, fps using ffprobe."""
    try:
        import json
        result = subprocess.run([
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration:stream=width,height,r_frame_rate",
            "-of", "json", path
        ], capture_output=True, text=True)
        info      = json.loads(result.stdout)
        duration  = float(info["format"]["duration"])
        stream    = info["streams"][0]
        width     = stream.get("width", 0)
        height    = stream.get("height", 0)
        fps_raw   = stream.get("r_frame_rate", "30/1")
        fps       = round(eval(fps_raw), 2)
        return round(duration, 2), f"{width}x{height}", int(fps)
    except:
        return None, None, None


def intake(vendor, input_dir, output_dir, metadata_csv, vendor_csv, country, device):
    os.makedirs(output_dir, exist_ok=True)

    # Load existing metadata
    existing_uids = set()
    meta_rows     = []
    meta_fields   = [
        "video_uid", "vendor", "original_filename",
        "country", "device", "fps", "resolution",
        "duration_sec", "coarse_task", "fine_task",
        "intake_date", "deidentified", "validated",
        "split", "license", "file_name"
    ]

    if os.path.exists(metadata_csv):
        with open(metadata_csv) as f:
            reader = csv.DictReader(f)
            meta_rows = list(reader)
            existing_uids = {r["video_uid"] for r in meta_rows}

    # Find incoming videos
    raw_videos = sorted([
        f for f in os.listdir(input_dir)
        if f.lower().endswith((".mp4", ".mov", ".avi"))
    ])

    print(f"\n🎬 Found {len(raw_videos)} videos from {vendor}")
    print(f"📁 Output: {output_dir}\n")

    new_rows  = []
    total_sec = 0

    for original in raw_videos:
        src      = os.path.join(input_dir, original)
        vid_uuid = str(uuid.uuid4())
        new_name = f"{vid_uuid}.mp4"
        dst      = os.path.join(output_dir, new_name)
        hf_path  = f"videos/vendor_{vendor}/{new_name}"

        duration, resolution, fps = get_video_info(src)
        total_sec += duration or 0

        shutil.copy2(src, dst)

        new_rows.append({
            "video_uid":         vid_uuid,
            "vendor":            vendor,
            "original_filename": original,
            "country":           country,
            "device":            device,
            "fps":               fps or "",
            "resolution":        resolution or "",
            "duration_sec":      duration or "",
            "coarse_task":       "",          # fill later
            "fine_task":         "",          # fill later
            "intake_date":       datetime.today().strftime("%Y-%m-%d"),
            "deidentified":      "no",        # update after de-id
            "validated":         "no",        # update after validation
            "split":             "train",
            "license":           "CC-BY-4.0",
            "file_name":         hf_path
        })

        print(f"  ✓ {original} → {vid_uuid[:8]}...")

    # Write metadata
    all_rows = meta_rows + new_rows
    with open(metadata_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=meta_fields)
        writer.writeheader()
        writer.writerows(all_rows)

    # Write vendor metadata
    vendor_csv_path = vendor_csv.replace("VENDOR", vendor)
    with open(vendor_csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=meta_fields)
        writer.writeheader()
        writer.writerows([r for r in all_rows if r["vendor"] == vendor])

    total_hrs = total_sec / 3600
    print(f"\n✅ Intake complete")
    print(f"   Videos  : {len(new_rows)}")
    print(f"   Hours   : {total_hrs:.1f}")
    print(f"\n⚠️  Next step: run deidentify.py on {output_dir}")
    print(f"   Then:      run validate.py --vendor {vendor}")
    print(f"   Then:      run upload.sh {vendor}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Karma-Ego vendor intake")
    parser.add_argument("--vendor",   required=True, help="Vendor name e.g. VisionLabs")
    parser.add_argument("--input",    required=True, help="Input folder with vendor videos")
    parser.add_argument("--output",   default="./videos", help="Output video folder")
    parser.add_argument("--metadata", default="./metadata/global_metadata.csv")
    parser.add_argument("--vendor-csv", default="./metadata/VENDOR_metadata.csv")
    parser.add_argument("--country",  default="Unknown")
    parser.add_argument("--device",   default="Unknown")
    args = parser.parse_args()

    os.makedirs("./metadata", exist_ok=True)
    os.makedirs(f"./videos/vendor_{args.vendor}", exist_ok=True)

    intake(
        vendor       = args.vendor,
        input_dir    = args.input,
        output_dir   = f"./videos/vendor_{args.vendor}",
        metadata_csv = args.metadata,
        vendor_csv   = args.vendor_csv,
        country      = args.country,
        device       = args.device
    )