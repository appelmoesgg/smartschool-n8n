import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

export class SmartschoolSessionValidator {
    description = require('./SmartschoolSessionValidator.node.json');

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

        const phpSessId = this.getNodeParameter('phpSessId', 0) as string;
        const creds = await this.getCredentials('SmartschoolSessionApi');

        const options = {
				headers: {
					cookie: `PHPSESSID=${phpSessId}`,
				},
		};
		const result = await fetch(`https://${creds.domain}`, options);

        if (!result.redirected){
            return [
                this.helpers.returnJsonArray([
                    {
                        valid: true,
                    },
                ]),
            ];
        } else {
            return [
                this.helpers.returnJsonArray([
                    {
                        valid: false,
                    },
                ]),
            ];
        }
    }
}
