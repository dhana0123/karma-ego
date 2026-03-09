"""
Karma-Ego CLI — Download egocentric datasets from HF
Usage: karmaego [command] [options]
"""

import os
import sys
import shutil
import argparse
from huggingface_hub import snapshot_download, hf_hub_download

# ─── CONFIG ───────────────────────────────────────────────
REPO_ID   = "karma-ego/global"
REPO_TYPE = "dataset"
HF_URL    = "https://huggingface.co/datasets/karma-ego/global"
# ──────────────────────────────────────────────────────────


def print_banner():
    print("""
╔═══════════════════════════════════════════╗
║           KARMA-EGO  v0.1.0               ║
║   Open Egocentric Dataset for Physical AI  ║
║   huggingface.co/karma-ego                ║
╚═══════════════════════════════════════════╝
""")


def flatten_videos(src_dir, dst_dir):
    """Flatten all .mp4 files from vendor subfolders into one flat folder."""
    os.makedirs(dst_dir, exist_ok=True)
    count = 0
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(".mp4"):
                src = os.path.join(root, file)
                dst = os.path.join(dst_dir, file)
                # Handle duplicate filenames
                if os.path.exists(dst):
                    base, ext = os.path.splitext(file)
                    dst = os.path.join(dst_dir, f"{base}_{count}{ext}")
                shutil.move(src, dst)
                count += 1
    return count


def build_allow_patterns(args):
    """Build HF allow_patterns from CLI args."""
    patterns = []

    # Always include metadata
    patterns.append("metadata/*.csv")
    patterns.append("metadata/*.json")
    patterns.append("README.md")

    if args.metadata_only:
        return patterns

    if args.vendor:
        patterns.append(f"videos/vendor_{args.vendor}/*")
        patterns.append(f"metadata/{args.vendor}_metadata.csv")
        return patterns

    if args.task or args.country or args.device or args.fps or args.resolution:
        # Need to filter by metadata first
        # Download metadata, filter, then download specific files
        return patterns  # metadata only first, then filter

    # Full dataset
    patterns.append("videos/*/*.mp4")
    return patterns


def cmd_download(args):
    """Download dataset with filters."""
    print_banner()

    output = args.output or "./karma-ego-data"
    os.makedirs(output, exist_ok=True)

    # Enable fast transfer
    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"

    print(f"📥 Downloading to: {output}")
    print(f"📦 Repo: {REPO_ID}\n")

    # ── Metadata only ──────────────────────────────────────
    if args.metadata_only:
        print("📋 Downloading metadata only...")
        snapshot_download(
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            local_dir=output,
            allow_patterns=["metadata/*.csv", "metadata/*.json", "README.md"],
            revision=args.version or "main"
        )
        print(f"\n✅ Metadata downloaded to {output}")
        return

    # ── Filter by task / country / device ─────────────────
    if args.task or args.country or args.device or args.fps or args.resolution:
        print("🔍 Filtering by metadata...")

        # Step 1: download metadata
        meta_dir = os.path.join(output, "_meta_tmp")
        snapshot_download(
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            local_dir=meta_dir,
            allow_patterns=["metadata/global_metadata.csv"],
            revision=args.version or "main"
        )

        # Step 2: filter
        import csv
        meta_path = os.path.join(meta_dir, "metadata", "global_metadata.csv")

        if not os.path.exists(meta_path):
            print("❌ global_metadata.csv not found")
            sys.exit(1)

        matched_files = []
        matched_vendors = set()

        with open(meta_path) as f:
            reader = csv.DictReader(f)
            for row in reader:
                if args.task and args.task.lower() not in row.get("coarse_task","").lower():
                    if args.task.lower() not in row.get("fine_task","").lower():
                        continue
                if args.country and args.country.lower() != row.get("country","").lower():
                    continue
                if args.device and args.device.lower() not in row.get("device","").lower():
                    continue
                if args.fps and str(args.fps) != str(row.get("fps","")):
                    continue
                if args.resolution and args.resolution.lower() not in row.get("resolution","").lower():
                    continue
                matched_files.append(row["file_name"])
                matched_vendors.add(row["vendor"])

        if not matched_files:
            print("⚠️  No videos match your filters")
            print("💡 Try: karmaego metadata --task cooking")
            sys.exit(0)

        print(f"✅ Found {len(matched_files)} videos across {len(matched_vendors)} vendors\n")

        # Step 3: download matched files
        for file_path in matched_files:
            print(f"  ⬇  {file_path}")
            try:
                hf_hub_download(
                    repo_id=REPO_ID,
                    repo_type=REPO_TYPE,
                    filename=file_path,
                    local_dir=output,
                )
            except Exception as e:
                print(f"  ⚠️  Failed: {e}")

        # Cleanup tmp
        shutil.rmtree(meta_dir, ignore_errors=True)

    # ── Vendor specific ────────────────────────────────────
    elif args.vendor:
        print(f"🏢 Downloading vendor: {args.vendor}")
        snapshot_download(
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            local_dir=output,
            allow_patterns=[
                f"videos/vendor_{args.vendor}/*",
                f"metadata/{args.vendor}_metadata.csv",
                "README.md"
            ],
            revision=args.version or "main"
        )

    # ── Full dataset ───────────────────────────────────────
    else:
        print("📦 Downloading full dataset...")
        print("⚠️  This may be large. Use --task or --vendor to filter.\n")
        snapshot_download(
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            local_dir=output,
            revision=args.version or "main"
        )

    # ── Flatten ────────────────────────────────────────────
    if args.flat:
        print("\n📂 Flattening videos into single folder...")
        flat_dir  = os.path.join(output, "flat")
        video_dir = os.path.join(output, "videos")
        if os.path.exists(video_dir):
            count = flatten_videos(video_dir, flat_dir)
            print(f"✅ {count} videos flattened to {flat_dir}")
        else:
            print("⚠️  No videos folder found to flatten")

    print(f"\n✅ Done — data saved to {output}")
    print(f"📖 Dataset info: {HF_URL}")


def cmd_vendors(args):
    """Search and list vendors."""
    print_banner()

    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
    tmp_dir = "./_karma_tmp"

    print("🔍 Fetching vendor catalog...\n")

    try:
        snapshot_download(
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            local_dir=tmp_dir,
            allow_patterns=["metadata/vendor_catalog.csv"]
        )
    except Exception as e:
        print(f"❌ Could not fetch catalog: {e}")
        sys.exit(1)

    import csv
    catalog_path = os.path.join(tmp_dir, "metadata", "vendor_catalog.csv")

    if not os.path.exists(catalog_path):
        print("❌ vendor_catalog.csv not found")
        sys.exit(1)

    results = []
    with open(catalog_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if args.task and args.task.lower() not in row.get("task","").lower():
                continue
            if args.country and args.country.lower() not in row.get("country","").lower():
                continue
            if args.device and args.device.lower() not in row.get("device","").lower():
                continue
            if args.status and args.status.lower() != row.get("status","").lower():
                continue
            if args.validated and row.get("validated","").lower() != "yes":
                continue
            results.append(row)

    if not results:
        print("⚠️  No vendors match your search")
        print("💡 Try: karmaego vendors --task cooking")
    else:
        print(f"Found {len(results)} vendor(s):\n")
        print("─" * 60)
        seen = set()
        for row in results:
            vendor = row.get("vendor","")
            if vendor in seen:
                continue
            seen.add(vendor)
            validated = "✅ Validated by Karma" if row.get("validated") == "yes" else "⏳ Pending"
            print(f"🏢  {vendor}")
            print(f"    {validated}")
            print(f"    📍 {row.get('country','')}  |  🎥 {row.get('device','')}  |  {row.get('fps','')}fps  |  {row.get('resolution','')}")
            print(f"    📁 {row.get('hours','')} hours  |  Task: {row.get('task','')}  |  {row.get('status','')}")
            print(f"    HF: huggingface.co/datasets/karma-ego/{vendor}")
            print("─" * 60)

    shutil.rmtree(tmp_dir, ignore_errors=True)


def cmd_metadata(args):
    """Show metadata stats."""
    print_banner()

    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
    tmp_dir = "./_karma_tmp"

    print("📋 Fetching metadata...\n")

    snapshot_download(
        repo_id=REPO_ID,
        repo_type=REPO_TYPE,
        local_dir=tmp_dir,
        allow_patterns=["metadata/global_metadata.csv"]
    )

    import csv
    meta_path = os.path.join(tmp_dir, "metadata", "global_metadata.csv")

    if not os.path.exists(meta_path):
        print("❌ Metadata not found")
        sys.exit(1)

    rows = []
    with open(meta_path) as f:
        rows = list(csv.DictReader(f))

    # Filter
    filtered = rows
    if args.task:
        filtered = [r for r in filtered if args.task.lower() in r.get("coarse_task","").lower()]
    if args.country:
        filtered = [r for r in filtered if args.country.lower() == r.get("country","").lower()]
    if args.vendor:
        filtered = [r for r in filtered if args.vendor.lower() == r.get("vendor","").lower()]

    # Stats
    total_hrs = sum(float(r.get("duration_sec",0)) for r in filtered) / 3600
    vendors   = set(r.get("vendor","") for r in filtered)
    tasks     = set(r.get("coarse_task","") for r in filtered)
    countries = set(r.get("country","") for r in filtered)

    print(f"📊 Dataset Stats")
    print("─" * 40)
    print(f"  Videos     : {len(filtered):,}")
    print(f"  Hours      : {total_hrs:,.1f}")
    print(f"  Vendors    : {len(vendors)}")
    print(f"  Tasks      : {', '.join(sorted(tasks))}")
    print(f"  Countries  : {', '.join(sorted(countries))}")
    print("─" * 40)

    shutil.rmtree(tmp_dir, ignore_errors=True)


def main():
    parser = argparse.ArgumentParser(
        prog="karmaego",
        description="Karma-Ego — Open egocentric dataset for physical AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  karmaego download --full
  karmaego download --task cooking --country India
  karmaego download --vendor VisionLabs --flat
  karmaego download --task cooking --fps 60 --flat --output ./data
  karmaego download --metadata-only
  karmaego download --version v1.0
  karmaego vendors --task cooking --country India
  karmaego vendors --validated
  karmaego metadata --task cooking
        """
    )

    sub = parser.add_subparsers(dest="command", help="Command to run")

    # ── download ───────────────────────────────────────────
    dl = sub.add_parser("download", help="Download dataset")
    dl.add_argument("--vendor",        type=str,  help="Vendor name e.g. VisionLabs")
    dl.add_argument("--task",          type=str,  help="Task type e.g. cooking")
    dl.add_argument("--country",       type=str,  help="Country e.g. India")
    dl.add_argument("--device",        type=str,  help="Device e.g. GoPro")
    dl.add_argument("--fps",           type=int,  help="Frames per second e.g. 60")
    dl.add_argument("--resolution",    type=str,  help="Resolution e.g. 4K")
    dl.add_argument("--version",       type=str,  help="Dataset version e.g. v1.0")
    dl.add_argument("--flat",          action="store_true", help="Flatten all videos into one folder")
    dl.add_argument("--metadata-only", action="store_true", help="Download metadata only")
    dl.add_argument("--full",          action="store_true", help="Download full dataset")
    dl.add_argument("--output",        type=str,  help="Output directory (default: ./karma-ego-data)")

    # ── vendors ────────────────────────────────────────────
    vd = sub.add_parser("vendors", help="Search vendors")
    vd.add_argument("--task",      type=str,  help="Filter by task")
    vd.add_argument("--country",   type=str,  help="Filter by country")
    vd.add_argument("--device",    type=str,  help="Filter by device")
    vd.add_argument("--status",    type=str,  help="on_shelf or on_demand")
    vd.add_argument("--validated", action="store_true", help="Show only Karma validated vendors")

    # ── metadata ───────────────────────────────────────────
    mt = sub.add_parser("metadata", help="Show dataset metadata stats")
    mt.add_argument("--task",    type=str, help="Filter by task")
    mt.add_argument("--country", type=str, help="Filter by country")
    mt.add_argument("--vendor",  type=str, help="Filter by vendor")

    args = parser.parse_args()

    if args.command == "download":
        cmd_download(args)
    elif args.command == "vendors":
        cmd_vendors(args)
    elif args.command == "metadata":
        cmd_metadata(args)
    else:
        print_banner()
        parser.print_help()


if __name__ == "__main__":
    main()