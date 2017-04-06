speech-to-flac
==============

Example for client-side encoding microphone audio into FLAC.

This is a demo for JavaScript FLAC encoder [libflac.js][1].

Similar to the [Speech-To-File][2] demo, this demo records audio from the
microphone and encodes it into FLAC data.
The _Speech-To-File_ demo is based on A. Krennmair's [Speech-To-Server][3] demo.

When recording is stopped, a download link for the encoded data is triggered.

Encoding etc. works completely client-side, i.e. no data is sent to any server.


As a special option, the FLAC data can be sent to the Google Speech Recognition
web service.
NOTE that you need to set your (secret) API key for the recognition service first
(see comment in [app.js](./app.js)
 for more details).

Demo
----
Try out at the [demo page][4].

Setup:
 * your device needs a microphone
 * accept, when asked to allow your browser access to the microphone

Usage:
 * select `FLAC-file` for encoding the audio in FLAC format (or `WAV` for uncompressed audio)
 * press `Start recording` will start recording (you may need to allow your browser access to your microphone in this step)
 * pressing `Stop recording` will open a dialog for downloading the recorded file (FLAC or WAV)
 * note: recording & encoding to FLAC is done all on the client-side (i.e. within your browser); no data is sent to a server. 

**NOTE:**
If you access the demo page via `https`, most browser will make the permission for accessing your microphone from this page will be persistent; if accessed via `http` the permission only lasts until you leave the page.


[1]: https://github.com/mmig/libflac.js
[2]: https://github.com/mmig/speech-to-file
[3]: https://github.com/akrennmair/speech-to-server
[4]: https://mmig.github.io/speech-to-flac/
