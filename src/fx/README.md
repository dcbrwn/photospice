# Photospice effects

Effects are simple OpenGL programs ([GLSL shaders](https://www.khronos.org/registry/webgl/specs/latest/1.0/)) with a bit of information about their parameters (aka uniforms). For effect definition I use [YAML format](http://yaml.org). Here is basic color filter effect:

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
