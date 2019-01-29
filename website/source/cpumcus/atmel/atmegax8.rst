ATMega48 / ATMega88 / ATMega168 / ATMega328
===========================================

Summary
-------

+------------+---------------------+---------+
| Category   | Feature             | Present |
+============+=====================+=========+
|Debugging   | JTAG port           | No      |
|            +---------------------+---------+
|            | SWD port            | No      |
|            +---------------------+---------+
|            | Custom debug port   | Yes     |
+------------+---------------------+---------+
| Protections| Read-out protection | Yes     |
|            +---------------------+---------+
|            | Known bypass        | No      |
+------------+---------------------+---------+

Features
--------

ATMEL's ATMegaX8 is a 8-bit MCU with SPI, I2C and PWM support.


Firmware Extraction
-------------------

Extract firmware through ISP
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Using an USBASP programmer combined with *avrdude*, one may be able to extract the flash and eeprom memory of an ATMegaX8 MCU.

.. code-block:: text

    $ avrdude -c usbasp -p atmega328p -U flash:r:firmware.bin:r

Protections
~~~~~~~~~~~

ATMEL designed 2 lock bits in order to restrict access to the flash memory: LB1 and LB2. These lock bits define the security mode used by the MCU.

+------+-----+-----+-------------------------+--------------------------------+
| Mode | LB1 | LB2 | Description             | Firmware extraction possible ? |
+======+=====+=====+=========================+================================+
| 1    | 1   | 1   | No memory lock enabled  | **YES**                        |
+------+-----+-----+-------------------------+--------------------------------+
| 1    | 1   | 0   | Programming disabled    | **NO**                         |
+------+-----+-----+-------------------------+--------------------------------+
| 1    | 0   | 0   | Programming disabled    | **NO**                         |
+------+-----+-----+-------------------------+--------------------------------+
