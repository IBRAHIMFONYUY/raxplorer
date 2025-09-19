import { config } from 'dotenv';
config();

import '@/ai/flows/mock-server-generation.ts';
import '@/ai/flows/code-snippet-generation.ts';
import '@/ai/flows/auto-api-documentation.ts';