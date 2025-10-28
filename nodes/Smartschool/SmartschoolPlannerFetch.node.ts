import { NodeOperationError, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { safeFetch } from './safeFetch';



async function parsePlannerResponse(
		this:  IExecuteFunctions,
		response: Response,
	): Promise<any> {
		try {
			const data = await response.json();
			return data;
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Failed to parse planner response to JSON, check your PHPSESSID and/or User ID: ${error.message}`,
			);
		}
	}

export class SmartschoolPlannerFetch {
	description = require('./SmartschoolPlannerFetch.node.json');

	async execute(
		this: IExecuteFunctions,
	): Promise<INodeExecutionData[][]> {
		const phpSessId = this.getNodeParameter('phpSessId', 0) as string;
		const userId = this.getNodeParameter('userId', 0) as string;
		const fromDate = this.getNodeParameter('fromDate', 0) as string;
		const toDate = this.getNodeParameter('toDate', 0) as string;
		let types = this.getNodeParameter('types', 0)?.toString();

		const creds = await this.getCredentials('SmartschoolSessionApi');

		const plannerUrl = `https://${creds.domain}/planner/api/v1/planned-elements/user/${userId}?from=${fromDate.split('T')[0]}&to=${toDate.split('T')[0]}&types=${types}`;

		const options = {
			headers: {
				cookie: `PHPSESSID=${phpSessId}`,
			},
		};

		const response = await safeFetch.call(this, plannerUrl, options);

		const data = await parsePlannerResponse.call(this, response);

		return [
			this.helpers.returnJsonArray([
				{
					plannerData: data,
				},
			]),
		];
	}
}
