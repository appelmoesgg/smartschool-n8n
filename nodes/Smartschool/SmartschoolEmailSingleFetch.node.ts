import { type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { safeFetch } from './safeFetch';
import { XMLParser } from "fast-xml-parser";

async function fetchMailWithCommand(
	this: IExecuteFunctions,
	commandXml: string,
	phpSessId: string,
	creds: { domain: string },
) {
	const response = await safeFetch.call(
		this,
		`https://${creds.domain}/?module=Messages&file=dispatcher`,
		{
			headers: {
				'content-type': 'application/x-www-form-urlencoded', // rel importante otherwise no workie
				cookie: `PHPSESSID=${phpSessId}`,
			},
			body: `command=${encodeURIComponent(commandXml)}`,
			method: 'POST',
		},
	);

    const parser = new XMLParser({
        ignoreAttributes: false,     // keep attributes like <tag attr="x">
        trimValues: true,            // trim whitespace
        parseTagValue: true,         // auto-convert numbers, booleans, etc.
        htmlEntities: true,
    });

	const body: any = await response.text();
	const parsedXml: any = parser.parse(body);

	return parsedXml;
}

export class SmartschoolEmailSingleFetch {
	description = require('./SmartschoolEmailSingleFetch.node.json');

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('SmartschoolSessionApi');
		const phpSessId = this.getNodeParameter('phpSessId', 0) as string;
		const mailId = this.getNodeParameter('mailId', 0) as string;

		let mail: any = null;

		const fetchMailCommand = `<request>
                                    <command>
                                        <subsystem>postboxes</subsystem>
                                        <action>show message</action>
                                        <params>
                                            <param name="msgID"><![CDATA[${mailId}]]></param>
                                            <param name="boxType"><![CDATA[inbox]]></param>
                                            <param name="limitList"><![CDATA[true]]></param>
                                        </params>
                                    </command>
                                </request>`;

		const mailJson = await fetchMailWithCommand.call(
			this,
			fetchMailCommand,
			phpSessId,
			creds as { domain: string },
		);

        let msg = mailJson.server.response.actions.action.data.message;
		if (msg) {
            msg.body = msg.body.replace(/\n/g, '');
			mail = msg;
		}

		return [
			this.helpers.returnJsonArray([
				{
					success: true,
					data: mail,
				},
			]),
		];
	}
}
