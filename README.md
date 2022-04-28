# AWS Premiere Pro Unreal plugin

This is a work in progress for a Premiere Pro plugin that integrates with the existing [Unreal render pipeline](https://bitbucket.org/imagination/aws-unreal-renderpipeline).


## Dev Setup
> Due to Adobe's CEP system, it's not possible to set this project up for development on a network drive.

### Prerequisites:
- [Node.js](https://nodejs.org/en/download/)
- Yarn `npm install --global yarn`

### Point Adobe Premiere to your local checkout:

- Open an Powershell / Terminal window
- Navigate to this project folder
- Run `yarn` to install tooling dependencies
- Run `yarn link-premiere` (or `node .scripts/link-premiere.js`)
- Confirm the Admin dialog when it asks (Windows only)

If this folder already exists, this script will fail, delete the folder and rerun the script.

- Win: `C:\Users\<USERNAME>\AppData\Roaming\Adobe\CEP\extensions\tbyrne.unreal.bridge`
- Mac: `~/Library/Application Support/Adobe/CEP/extensions/tbyrne.unreal.bridge`

This will set up a symlink from the Adobe extensions folder into this repo, allowing you to work from the same directory that Premiere is watching.
You will need to restart Premiere if it was already running, to detect the new extension.

### Start development servers

Before opening the panel in Premiere you'll need to start the development servers.

Run `yarn serve` to start both the backend and frontend development servers.

If either server is killed, the other will also exit.

### Open Plugin

It should now be possible to open the plugin in Premiere.

- In the Premiere menu bar, go to Window > Extensions > AWS Unreal
- Initially, the pre-built version of the frontend will load, click the localhost:8080 link to navigate to the hot-reload version.

## Build Plugin:
See general Premiere plugin build instructions [here](https://github.com/Adobe-CEP/Samples/tree/master/PProPanel).

> When building on a platform other than Windows, you'll need to install [ZXPSignCMD](https://github.com/Adobe-CEP/CEP-Resources/blob/master/ZXPSignCMD) on the Path.

Run:
```sh
yarn full-build
```

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