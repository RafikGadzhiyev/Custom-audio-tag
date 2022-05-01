# Custom-audio-tag
This is a custom audio tag that was created using JavaScript OOP 
## Attributes
- `primary-color`: 
  this attribute takes the color that needs for background color of main container ***(by default: #000)***
- `secondary-color`:
  this attribute takes the color that needs for background color of audio tag components (by default: #FFF)
- `content-color`:
  this attribute takes the color that needs for color of text (by default: #00a322)
- `thumb-color`:
  this attribute takes the color that needs for sliders thumb (by default: #00a322)

## Inner 
`custom-audio` tag can contain a lot of audio tags. For example:
``` html
    <custom-audio primary-color='#4faad1' secondary-color='#fff' content-color='#12dfac' thumb-color='#fef301'>
        <audio src="firs-tracks.mp3" name='First track'></audio>
        <audio src="second-track.mp3" name='Second track'></audio>
        <audio src="third-track.mp3" name='Third track'></audio>
    </custom-audio>
```

# 🔴IMPORTANT🔴

<span style='font-size: 100px'>And you don't need to write logic for next or previous audio, because this tag includes multiple audios feature</mark>
