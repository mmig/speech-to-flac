importScripts('libflac3-1.3.2.min.js');

var flac_encoder,
	BUFSIZE = 4096,
	CHANNELS = 1,
	SAMPLERATE = 44100,
	COMPRESSION = 5,
	BPS = 16,
	flac_ok = 1,
	flacLength = 0,
	flacBuffers = [],
	WAVFILE = false,
	INIT = false,
	wavLength = 0,
	wavBuffers = [];

function write_callback_fn(buffer, bytes){
	flacBuffers.push(buffer);
	flacLength += buffer.byteLength;
}

function write_wav(buffer){
	wavBuffers.push(buffer);
	wavLength += buffer.length;
}

self.onmessage = function(e) {
	
	switch (e.data.cmd) {
	
	case 'save_as_wavfile':
		
		if (INIT == false){
			WAVFILE = true;
		}
		break;
		
	case 'init':
		
		if (WAVFILE){
			// save as WAV-file
			
            // WAV-FILE
            // create our WAV file header
            var buffer = new ArrayBuffer(44);
            var view = new DataView(buffer);
            // RIFF chunk descriptor
            writeUTFBytes(view, 0, 'RIFF');

            // set file size at the end
            writeUTFBytes(view, 8, 'WAVE');
            // FMT sub-chunk
            writeUTFBytes(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            // stereo (2 channels)
            view.setUint16(22, 1, true);
            view.setUint32(24, e.data.config.samplerate, true);
            view.setUint32(28, e.data.config.samplerate * 2 /* only one channel, else: 4 */, true);
            view.setUint16(32, 4, true);
            view.setUint16(34, 16, true);
            // data sub-chunk
            writeUTFBytes(view, 36, 'data');
            

        	// DUMMY file length (set real value on export)
            view.setUint32(4, 10, true);
        	// DUMMY data chunk length (set real value on export)
            view.setUint32(40, 10, true);

            // store WAV header
            wavBuffers.push(new Uint8Array(buffer));
            
        } else {
			
			// using FLAC

			if (!e.data.config) {
				e.data.config = { bps: BPS, channels: CHANNELS, samplerate: SAMPLERATE, compression: COMPRESSION };
			}

			e.data.config.channels = e.data.config.channels ? e.data.config.channels : CHANNELS;
			e.data.config.samplerate = e.data.config.samplerate ? e.data.config.samplerate : SAMPLERATE;
			e.data.config.bps = e.data.config.bps ? e.data.config.bps : BPS;
			e.data.config.compression = e.data.config.compression ? e.data.config.compression : COMPRESSION;

			////
			COMPRESSION = e.data.config.compression;
			BPS = e.data.config.bps;
			SAMPLERATE = e.data.config.samplerate;
			CHANNELS = e.data.config.channels;
			////
			
			if(!Flac.isReady()){
				Flac.onready = function(){
					
					setTimeout(function(){
						initFlac();
					},0);
				}
			} else {
				initFlac();
			}
		}
		break;
		
	case 'encode':

		if (WAVFILE){

			// WAVE - PCM
			write_wav(e.data.buf);

		} else {
			
			// FLAC
			encodeFlac(e.data.buf);
			
		}
		break;
		
	case 'finish':
		
		var data;
		if (WAVFILE){
			
			data = exportMonoWAV(wavBuffers, wavLength);
			
		} else {
			
			if(!Flac.isReady()){
				
				console.error('Flac was not initialized: could not encode data!');
				
			} else {
				
				flac_ok &= Flac.FLAC__stream_encoder_finish(flac_encoder);
				console.log("flac finish: " + flac_ok);//DEBUG
				data = exportFlacFile(flacBuffers, flacLength, mergeBuffersUint8);
				
				Flac.FLAC__stream_encoder_delete(flac_encoder);
			}
		}

		clear();
		
		self.postMessage({cmd: 'end', buf: data});
		INIT = false;
		break;
	}
};

//HELPER: handle initialization of flac encoder
function initFlac(){
	
	flac_encoder = Flac.init_libflac_encoder(SAMPLERATE, CHANNELS, BPS, COMPRESSION, 0);
	////
	if (flac_encoder != 0){
		var status_encoder = Flac.init_encoder_stream(flac_encoder, write_callback_fn);
		flac_ok &= (status_encoder == 0);
		
		console.log("flac init     : " + flac_ok);//DEBUG
		console.log("status encoder: " + status_encoder);//DEBUG
		
		INIT = true;
	} else {
		console.error("Error initializing the encoder.");
	}
}

//HELPER: handle incoming PCM audio data for Flac encoding:
function encodeFlac(audioData){
	
	if(!Flac.isReady()){
		
		//if Flac is not ready yet: buffer the audio
		wavBuffers.push(audioData);
		console.info('buffered audio data for Flac encdoing')
		
	} else {
	
		if(wavBuffers.length > 0){
			//if there is buffered audio: encode buffered first (and clear buffer)
			
			var len = wavBuffers.length;
			var buffered = wavBuffers.splice(0, len);
			for(var i=0; i < len; ++i){
				doEncodeFlac(buffered[i]);
			}
		}
	
		doEncodeFlac(audioData);
	}
}

//HELPER: actually encode PCM data to Flac
function doEncodeFlac(audioData){
	
	var buf_length = audioData.length;
	var buffer_i32 = new Uint32Array(buf_length);
	var view = new DataView(buffer_i32.buffer);
	var volume = 1;
	var index = 0;
	for (var i = 0; i < buf_length; i++){
		view.setInt32(index, (audioData[i] * (0x7FFF * volume)), true);
		index += 4;
	}

	var flac_return = Flac.FLAC__stream_encoder_process_interleaved(flac_encoder, buffer_i32, buffer_i32.length / CHANNELS);
	if (flac_return != true){
		console.log("Error: encode_buffer_pcm_as_flac returned false. " + flac_return);
	}
}

function exportFlacFile(recBuffers, recLength){

	//convert buffers into one single buffer
	var samples = mergeBuffersUint8(recBuffers, recLength);

//	var audioBlob = new Blob([samples], { type: type });
	var the_blob = new Blob([samples], { type: 'audio/flac' });
	return the_blob;
	
}

function exportMonoWAV(buffers, length){
	//buffers: array with
	//  buffers[0] = header information (with missing length information)
	//  buffers[1] = Float32Array object (audio data)
	//  ...
	//  buffers[n] = Float32Array object (audio data)
	
	var dataLength = length * 2;
	var buffer = new ArrayBuffer(44 + dataLength);
	var view = new DataView(buffer);

	//copy WAV header data into the array buffer
	var header = buffers[0];
	var len = header.length;
	for(var i=0; i < len; ++i){
		view.setUint8(i, header[i]);
	}
	
	//add file length in header
    view.setUint32(4, 32 + dataLength, true);
	//add data chunk length in header
    view.setUint32(40, dataLength, true);

    //write audio data
	floatTo16BitPCM(view, 44, buffers);

	return new Blob([view], { type: 'audio/wav' });
}

function writeUTFBytes(view, offset, string){ 
	var lng = string.length;
	for (var i = 0; i < lng; ++i){
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

function mergeBuffersUint8(channelBuffer, recordingLength){
	var result = new Uint8Array(recordingLength);
	var offset = 0;
	var lng = channelBuffer.length;
	for (var i = 0; i < lng; i++){
		var buffer = channelBuffer[i];
		result.set(buffer, offset);
		offset += buffer.length;
	}
	return result;
}

function floatTo16BitPCM(output, offset, inputBuffers){
	
	var input, jsize = inputBuffers.length, isize, i, s;
	
	//first entry is header information (already used in exportMonoWAV),
	//  rest is Float32Array-entries -> ignore header entry
	for (var j = 1; j < jsize; ++j){
		input = inputBuffers[j];
		isize = input.length;
		for (i = 0; i < isize; ++i, offset+=2){
			s = Math.max(-1, Math.min(1, input[i]));
			output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
		}
	}
}

/*
 * clear recording buffers
 */
function clear(){
	flacBuffers.splice(0, flacBuffers.length);
	flacLength = 0;
	wavBuffers.splice(0, wavBuffers.length);
	wavLength = 0;
}
