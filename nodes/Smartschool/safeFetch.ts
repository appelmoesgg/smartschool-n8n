import { type IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

export async function safeFetch(
        this: IExecuteFunctions,
        url: string,
        options: object,
    ): Promise<Response> {
        try {
            const response = await fetch(url, options);

            if (response.status === 403) {
                throw new NodeOperationError(this.getNode(), `HTTP error! You are probably using an invalid User ID... Status: ${response.status}`);
            } else if (response.status > 500){
                throw new NodeOperationError(this.getNode(), `HTTP error! Smartschool server seems to be down or unreachable. Status: ${response.status}`);
            } else if (response.redirected){
                throw new NodeOperationError(this.getNode(), `Session seems to be invalid, you got redirected to ${response.url}. Are you using a valid PHPSESSID? (use the session generator node)`);
            }

            return response;

        } catch (error) {
            if (error instanceof NodeOperationError) {
			    throw error;
		    }

            throw new NodeOperationError(
                this.getNode(),
                `Failed to fetch planner data: ${error.message} (are you connected to the internet?)`,
            );
        }
        
    }