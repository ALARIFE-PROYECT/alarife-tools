#!/usr/bin/env node
import { ProgramLineInterface } from '@alarife/commander';
import { getPackage } from './utils/package';
import { ADD_LICENSE_COMMAND, COPY_COMMAND, DECRYPT_COMMAND, ENCRYPT_COMMAND, GENERATE_KEY_COMMAND, NEW_PLUGIN_COMMAND } from './constants/commands';


const TOOLS = [
    ADD_LICENSE_COMMAND,
    COPY_COMMAND,
    GENERATE_KEY_COMMAND,
    ENCRYPT_COMMAND,
    DECRYPT_COMMAND,
    NEW_PLUGIN_COMMAND,
]

const packageJson = getPackage();
const cli = new ProgramLineInterface(TOOLS, packageJson.version);

cli.parse(process.argv, 'node');
