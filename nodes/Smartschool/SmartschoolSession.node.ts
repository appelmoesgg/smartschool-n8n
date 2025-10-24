import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { browserLogin } from './browserLogin';

export class SmartschoolSession {
	description = require('./SmartschoolSession.node.json');

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('SmartschoolSessionApi');

		const result = await browserLogin(creds as {
            domain: string;
            email: string;
            password: string;
            birthdate: string;
        });

		return [
			this.helpers.returnJsonArray([
				{
					success: true,
					phpSessId: result.phpSessId,
				},
			]),
		];
	}
}
