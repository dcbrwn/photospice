# Photospice effects

In this folder you'll find built-in photospice effects. You are free to use them as an example or even as a base for your own effects!

Effects are simple programs called fragment (or pixel) shaders ([GLSL shaders](https://www.khronos.org/registry/webgl/specs/latest/1.0/)). If you are not familiar with GLSL yet, spend a bit of time [googling](https://www.google.ru/search?q=introduction+to+GLSL) and then head to [Shadertoy](http://shadertoy.com) to get some practice.

For effect definition I use [YAML format](http://yaml.org). Here is basic color filter effect:

```yml
# Name and description of the effect. Nothing special here.
name: Colorize
description: Apply simple color filter
# An array of effect parameters
uniforms:
  - name: Color # Display name shown in the UI
    description: A color # Uniform description shown in tooltips
    id: uColor # Internal name used in shader to access the uniform
    type: color # Uniform type. Currently supported types are float, vec2 and color
    default: [0.4, 1.0, 0.2] # default value of uniform
# Fragment shader source that will be used to render image
shader: |
  precision lowp float;

  varying vec2 vUv;
  uniform sampler2D uImage;
  uniform vec3 uColor;

  void main() {
    vec4 src = texture2D(uImage, vUv, 0.0);
    gl_FragColor.rgb = src.rgb * uColor;
    gl_FragColor.a = src.a;
  }
```

## Built-in uniforms/varyings

- `uniform sampler2D uImage` - A texture with image from previous render pass
- `varying vec2 vUv` - Texture coordinates of image
- `uniform vec2 iImageResolution` - Original image size
- `uniform vec2 iCanvasResolution` - Actual size of canvas used for rendering (usually bigger than image)

## How to use custom effects

On main screen click "Add effect" button and then "Upload your own". File selection dialog will pop up, so that you can find and select your effect. Currently I haven't added any debug tools into UI, so if your shader is incorrect all errors will be in JS console (hit F12 to open it).
