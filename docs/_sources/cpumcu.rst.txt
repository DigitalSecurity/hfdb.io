List of supported MCUs / CPUs
=============================

Here follows the list of known MCUs and CPUs, and for each of them a forensic summary describing:

    * If the device provides one or more debug ports and how to access theme
    * If the device includes memory and how to forensically extract information from it
    * If the device provides some kind of protection mechanism and how to bypass it (if possible)
    * If the device provides a communication port (UART, SPI, ...) and how to connect to these interfaces

Forensic summaries
------------------

.. toctree::
    :maxdepth: 2
    :glob:

    Atmel <cpumcus/atmel>
    Nordic Semiconductor <cpumcus/nordic-semi>
    Texas Instruments <cpumcus/ti>
