********************************************
IoT Forensic Investigator Tools & Techniques
********************************************

.. note:: This toolbox is incomplete and should be updated soon.


Hardware
========

Quick list of what you may need
-------------------------------

* Bluetooth 4.0 USB dongle
* USB serial adapter (UART)
* Raspberry Pi
* ST-Link v2
* CC Debugger
* EEPROM/Flash Programmer



Specific Forensic Software
==========================

We also develop `specific tools <https://github.com/digitalsecurity/hfdb.io/tree/master/tools/>`_ required to automate collection and extraction for some specific devices or file format, these tools
are part of this project and available in our Github repository. They are usually referenced in methodologies and may be found very quickly.


Techniques
==========

Debugging on the cheap
----------------------

Debuggers are expensive, such as TI CC Debugger or some JTAG adapters, but alternatives
exist. They are generally based on very common hardware such as Raspberry Pis,
Arduinos or event FT232H USB adapters.

This section details these alternatives, how to build or use them, and what their
features are.

* :ref:`ti-techniques-arduino-cc`

Bypassing hardware protections against firmware extraction
----------------------------------------------------------

Hardware protections can sometimes be bypassed with nifty tricks. This section
details every known bypass for various SoCs, MCUs, etc.

* :ref:`nrf51_bypass`
