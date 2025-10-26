import { NodeOperationError, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { smscHeadlessLogin } from './smscHeadlessLogin';

export class SmartschoolSessionGenerator {
	description = require('./SmartschoolSessionGenerator.node.json');

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('SmartschoolSessionApi');

		try {

			const result = await smscHeadlessLogin(
				creds as {
					domain: string;
					email: string;
					password: string;
					birthdate: string;
				},
			);

			return [
				this.helpers.returnJsonArray([
					{
						success: true,
						phpSessId: result.phpSessId,
						userId: result.userId,
					},
				]),
			];

		} catch (error) {
			throw new NodeOperationError(this.getNode(), `There was an error when logging in: ${(error).message}`);
		}
	}
}
