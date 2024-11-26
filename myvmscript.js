"use strict";

window.onload = function()
{
    var emulator = window.emulator = new V86({
        wasm_path: "./build/v86.wasm",
        memory_size: 32 * 1024 * 1024,
        vga_memory_size: 2 * 1024 * 1024,
        screen_container: document.getElementById("screen_container"),
        bios: {
          url: "./bios/seabios.bin",
        },
        vga_bios: {
            url: "./bios/vgabios.bin",
        },
        fda: {
            url: "./images/freedos722.img",
        },
        autostart: true,
    });

	// Define state, this is the object where we hold state
	//  Idea: Could I have these in an array, so that I can have mulitable online-save states?
    	var state;

	document.getElementById("save_restore").onclick = async function()
	    {
		var button = this;

		if(state)
		{
		    button.value = "Save state";
		    await emulator.restore_state(state);
		    document.getElementById("log").value += "Restored from state\n";
		    state = undefined;
		}
		else
		{
		    const new_state = await emulator.save_state();
		    
		    console.log("Saved state of " + new_state.byteLength + " bytes");
        	    document.getElementById("log").value += "Saved state of " + new_state.byteLength + " bytes\n";
		    
	   	    button.value = "Restore state";
		    state = new_state;
		}

		button.blur();
	    };

//////////////////////////////////////////////////
//////////////////////////////////////////////////
	document.getElementById("go_fullscreen").onclick = async function()
		{
			emulator.screen_go_fullscreen();
			
			//emulator.screen_set_scale(1,1);

		}

	// We are going to see if we can add the reset CPU call/button

	document.getElementById("ResetCPU").onclick = async function()
		{
			emulator.restart();

		}

  function resetCPU(){
    emulator.restart();
  }
//////////////////////////////////////////////////
//////////////////////////////////////////////////
	document.getElementById("save_file").onclick = async function()
	    {
		const new_state = await emulator.save_state();
		var a = document.createElement("a");
		a.download = "v86state.bin";
		a.href = window.URL.createObjectURL(new Blob([new_state]));
		a.dataset.downloadurl = "application/octet-stream:" + a.download + ":" + a.href;
		a.click();

		this.blur();
	    };

	    document.getElementById("restore_file").onchange = function()
	    {
		if(this.files.length)
		{
		    var filereader = new FileReader();
		    emulator.stop();

		    filereader.onload = async function(e)
		    {
			await emulator.restore_state(e.target.result);
			emulator.run();
		    };

		    filereader.readAsArrayBuffer(this.files[0]);

		    this.value = "";
		}

		this.blur();
	    };

//////////////////////////////////////////////////
//////////////////////////////////////////////////
    // In this example we wait for output from the serial terminal,
    var data = "";

    emulator.add_listener("serial0-output-byte", function(byte)
    {
        var char = String.fromCharCode(byte);

        data += char;
        document.getElementById("terminal").value += char;

	// Lets save this for later
        //emulator.serial0_send(current.send);

	// Seems here we are sending to the log window
        var log = "Recived: \"" + char + "\"\n";
        document.getElementById("log").value += log;
    });

    document.getElementById("log").value = "Emulator Initalized.\n";
//////////////////////////////////////////////////
//////////////////////////////////////////////////
};

