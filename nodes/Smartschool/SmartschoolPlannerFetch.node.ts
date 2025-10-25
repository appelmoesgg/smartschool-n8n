import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow'; 

export class SmartschoolPlannerFetch {
    description = require('./SmartschoolPlannerFetch.node.json');

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {


        return [
            this.helpers.returnJsonArray([
                {
                    success: true
                },
            ]),
        ];
    }
}
