# Photospice

WebGL-based multi-pass photo-effect processor :P. No flash, plugins or even back-end needed. All magic happens inside of client's browser. This has some drawbacks though. Not all devices/browsers support WebGL. Also to smoothly handle a pipeline with a bunch of complex effects, users will need to have pretty good rig.

## What works

* Multiple effects can be applied at same time
* A couple of basic effects are implemented
* User can reorder effects in pipeline

## What I'm aiming to fix

* Effect picker dialog with previews
* Presets for both single effects and pipeline as a whole
* Preview for image is quite static and can't be moved/zoomed
* The UI is not adapted for mobile devices yet
* UI goodies like custom color for background in preview
* Improve performance as much as possible
* Add support for multi-image effects. In fact I just need to add support for Sampler2D uniforms
* I'm still new to React and need to improve my skills with it

## What I want to implement

* More awesome effects
* Rendering of images bigger than GPU can handle directly (usually 2048x2048 to 4096x4096)
* Primitive GLSL->JS translator or just fallback to handwritten JS code. This is a **huge** challenge and will require a lot of effort even for basic implementation. And benefits are not so big, since if shaders are slow on some devices, doing this on CPU with JS (or even WebAssembly) will be a nightmare.
