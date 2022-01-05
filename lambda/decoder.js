
exports.handler = async function (event, context) {


    console.log('## EVENT: ' + JSON.stringify(event))

    // Read input parameters
    input_base64 = event.PayloadData
    payload_decoder_name = event.PayloadDecoderName
    fport = event.WirelessMetadata.LoRaWAN.FPort;


    // Logging
    console.log("Decoding payload " + input_base64 + " with fport " + fport + " using decoder " + payload_decoder_name)


    // Convert base64 payload into bytes
    let bytes = Uint8Array.from(Buffer.from(input_base64, 'base64'))

    try {


        // Execute the decoder
        result = Decoder(bytes, fport)
        result.status = 200

        console.log("Decoded payload is " + JSON.stringify(result))
        return result

    } catch (e) {
        // Perform exception handling
        console.log(e)

        result = {
            "status": 500,
            "errorMessage": e,
            "decoder_name": payload_decoder_name
        }
        return result;


    }

    function Decoder(bytes, port) {
        // Decode an uplink message from a buffer
        // (array) of bytes to an object of fields.
        var value = (bytes[0] << 8 | bytes[1]) & 0x3FFF;
        var bat = value / 1000;//Battery,units:V

        var door_open_status = bytes[0] & 0x80 ? 1 : 0;//1:open,0:close
        var water_leak_status = bytes[0] & 0x40 ? 1 : 0;

        var mod = bytes[2];
        var alarm = bytes[9] & 0x01;

        if (mod == 1) {
            var open_times = bytes[3] << 16 | bytes[4] << 8 | bytes[5];
            var open_duration = bytes[6] << 16 | bytes[7] << 8 | bytes[8];//units:min
            if (bytes.length == 10 && 0x07 > bytes[0] < 0x0f)
                return {
                    BAT_V: bat,
                    MOD: mod,
                    DOOR_OPEN_STATUS: door_open_status,
                    DOOR_OPEN_TIMES: open_times,
                    LAST_DOOR_OPEN_DURATION: open_duration,
                    ALARM: alarm
                };
        }
        else if (mod == 2) {
            var leak_times = bytes[3] << 16 | bytes[4] << 8 | bytes[5];
            var leak_duration = bytes[6] << 16 | bytes[7] << 8 | bytes[8];//units:min
            if (bytes.length == 10 && 0x07 > bytes[0] < 0x0f)
                var result1 = {
                    BAT_V: bat,
                    MOD: mod,
                    WATER_LEAK_STATUS: water_leak_status,
                    WATER_LEAK_TIMES: leak_times,
                    LAST_WATER_LEAK_DURATION: leak_duration
                }
            console.log("result is " + result1)
            return {
                BAT_V: bat,
                MOD: mod,
                WATER_LEAK_STATUS: water_leak_status,
                WATER_LEAK_TIMES: leak_times,
                LAST_WATER_LEAK_DURATION: leak_duration
            };
        }
        else if (mod == 3)
            if (bytes.length == 10 && 0x07 > bytes[0] < 0x0f) {
                return {
                    BAT_V: bat,
                    MOD: mod,
                    DOOR_OPEN_STATUS: door_open_status,
                    WATER_LEAK_STATUS: water_leak_status,
                    ALARM: alarm
                };
            }
            else {
                return {
                    BAT_V: bat,
                    MOD: mod,
                };
            }
    }




}




