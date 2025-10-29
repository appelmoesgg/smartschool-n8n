import { NodeOperationError, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { safeFetch } from './safeFetch';



async function parseResultsResponse(
        this:  IExecuteFunctions,
        response: Response,
    ): Promise<any> {
        try {
            const data = await response.json();
            return data;
        } catch (error) {
            throw new NodeOperationError(
                this.getNode(),
                `Failed to parse results response to JSON, check your PHPSESSID and/or User ID: ${error.message}`,
            );
        }
    }

export class SmartschoolResultsFetch {
    description = require('./SmartschoolResultsFetch.node.json');

    async execute(
        this: IExecuteFunctions,
    ): Promise<INodeExecutionData[][]> {
        const phpSessId = this.getNodeParameter('phpSessId', 0) as string;
        const amountOfResults = this.getNodeParameter('amountOfResults', 0) as number;

        const creds = await this.getCredentials('SmartschoolSessionApi');

        const resultsUrl = `https://${creds.domain}/results/api/v1/evaluations/?pageNumber=1&itemsOnPage=${amountOfResults}`;

        const options = {
            headers: {
                cookie: `PHPSESSID=${phpSessId}`,
            },
        };

        const response = await safeFetch.call(this, resultsUrl, options);

        const data = await parseResultsResponse.call(this, response);

        return [
            this.helpers.returnJsonArray([
                {
                    resultsData: data,
                },
            ]),
        ];
    }
}
