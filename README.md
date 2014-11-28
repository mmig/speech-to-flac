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
(see comment in [app.js](https://raw.githubusercontent.com/mmig/speech-to-flac/master/LICENSE/app.js)
 for more details).

[1]: https://github.com/mmig/libflac.js
[2]: https://github.com/mmig/speech-to-file
[3]: https://github.com/akrennmair/speech-to-server
