# AWS Premiere Pro Unreal plugin

This is a work in progress for a Premiere Pro plugin that integrates with the existing [Unreal render pipeline](https://bitbucket.org/imagination/aws-unreal-renderpipeline).


## Goals:

1. Cleanup existing sequence
  - Copy sequence (optionally)
  - Validate FPS (optionally)

2. Create Unreal track in sequence
  - Choose 'speaker' track/s
  - Create new track
  - Create image sequence project items for each quality level (2?)
  - Create new sequence with layers for each of these image sequences
  - Create track items in edit sequence using this sequence

3. Trigger UE pipeline render
  - Write JSON file/s based on sequence start/end + settings
  - **Show rendered frames as they complete from UE** (may require refresh in jsx)

4. Export Speaker tracks to UE (if possible)
  - Create 4k / 30fps sequence from edit sequence
  - Remove transforms / scale to fill frame
  - Export frames to standard path in UE proj