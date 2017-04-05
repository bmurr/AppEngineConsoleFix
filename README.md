# AppEngineConsole Fix
Extends the functionality of AppEngine's interactive console.
Replaces the default code input textbox with a CodeMirror editor.
Adds a history panel to store all previously run scripts.

## Installation
For the latest version of this extension, building from source is recommended.
However, if you don't want the hassle, you can find prebuilt releases under the Releases tab in Github. These contain all required source code and assets to use the extension.

Download the latest release and extract it somewhere locally.
You can load this into Chrome using the "Load unpacked extension" option in the Extensions panel.

## Building from source
First, you'll need npm or yarn installed. 
On OSX, you can do this with ```brew install node``` (installs npm too) or ```brew install yarn``` (if you already have node installed)

Then, run the appropriate command: ```npm install``` or ```yarn```
This will read the ```package.json``` and install Gulp and other required dependencies.

Gulp is used to perform various tasks, like building the project.

Some useful Gulp tasks (see ```gulpfile.js``` for the full list):

```gulp```

Runs 'default' task that builds the project and places output in 'build'
directory.

```gulp clean```

Deletes build directory.git checkout master