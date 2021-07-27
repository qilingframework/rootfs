### QNX rootfs
This repository contains some system files which are needed to emulate QNX using Qiling, as well as some example binaries.

#### QNX POSIX-compliant C library and ELF interpreter
The ELF interpreter is located in  `usr/lib/ldqnx.so.2`, which is also a symlink to `lib/libc.so.3`. The file is licensed under following Legal Identification Codes: `BSD-2C, BSD-3C, BSD-4C, ISC, ISC-ADK,
ISC-V, NOTE, UL` and has been taken from QNX SDP distribution.
The same holds for the file `lib/libm.so.2`.

#### Example binaries ####
`bin/hello` is a trivial sample binary, which outputs its command line arguments and environment. The binary is used by examples and tests.
`bin/hellosqrt` is linked against `libm.so.2` and uses the library functions to calculate sqrt(2). It serves as an example for dynamically linked executables.

#### System page snapshot ####
System page is a memory structure usually filled in by the startup code, which is run before the QNX kernel is started, and does stuff like setting up initial virtual memory mapping, and filling up the system page and other structures used to pass information about the CPU, memory, clock and other peripherals to the QNX kernel. The `syspage.bin` snapshot in this repo has been dumped from a QNX instance booting under `qemu-system-arm`'s `-M virt` virtual machine, and is used by the OS/syscall emulation code to provide some fake defaults to callers which might request this information.
