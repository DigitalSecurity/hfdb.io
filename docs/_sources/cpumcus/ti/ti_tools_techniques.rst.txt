================================================
Tools and Techniques for Assessing TI CCxxxx ICs
================================================

.. _ti-techniques-arduino-cc:

-----------------------------------
CC Debugger Emulation using Arduino
-----------------------------------

It is possible to emulate a TI debugger for the CC chips, running the CC.Debugger protocol, via bit-banging on an Arduino. Using the GPIO pins, and some code, most available arduinos are able to effectively act as debuggers for TI CC254x ICs.

The relevant code can be found `on GitHub <https://github.com/wavesoft/CCLib>`_.

Here is the BOM for this project:

* 1x Arduino - Use a Leonardo if possible
* 1x Breadboard
* 3x 100k resistors
* 3x 200k resistors
* cables for connecting things up

Operation is fairly straightforward:

#. Download the software using :code:`git clone https://github.com/wavesoft/CCLib.git` and :code:`cd` into the directory.
#. Open the Arduino code in the Arduino IDE, choose your device, then compile and upload the firmware to the Arduino.
#. Utilising the fritzing schematic on the github, some resistors, a breadboard, and some cables, wire up the Arduino debugger to the target. *NB* - note down your serial interface. It could be :code:`/dev/ttyS0` or :code:`/dev/ttyACM0` or similar. You will need this information.
#. Going to the Python directory, use the :code:`cc_info.py -p /dev/ttyS0` to check that things are working.
#. To read flash off the device use the command: :code:`./cc_read_flash.py -p /dev/ttyS0 --out=output.hex`
#. To write flash use the following command: :code:`./cc_read_flash.py -p /dev/ttyS0 --out=output.hex`
#. To let the device resume normal operations, use this command: :code:`./cc_resume.py -p /dev/ttyS0`
