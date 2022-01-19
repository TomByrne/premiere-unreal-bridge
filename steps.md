
- Cleanup sequence
  - Copy sequence (optionally)
  - Change FPS (optionally)

- Create Unreal track
  - Choose 'speaker' track/s
  - Create new track
  - Create image sequence project items for each quality level (2?)
  - Create new sequence with layers for each of these image sequences
  - Create track items in edit sequence using this sequence

- Generate new UE Speaker frames
  - Write JSON file/s based on sequence start/end + settings
  - **Show rendered frames as they complete from UE** (may require refresh in jsx)

- Export Speaker tracks to UE
  - Create 4k / 30fps sequence from edit sequence
  - Remove transforms / scale to fill frame
  - Export frames to standard path in UE proj