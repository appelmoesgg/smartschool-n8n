import { type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { XMLParser } from 'fast-xml-parser';
import { safeFetch } from './safeFetch';
//import * as util from 'util';

async function fetchMailWithCommand(this: IExecuteFunctions, commandXml: string, phpSessId: string, creds: {domain: string}) {
		const response = await safeFetch.call(this, `https://${creds.domain}/?module=Messages&file=dispatcher`, {
					headers: {
						'content-type': 'application/x-www-form-urlencoded', // rel importante otherwise no workie
						'cookie': `PHPSESSID=${phpSessId}`,
					},
					body: `command=${encodeURIComponent(commandXml)}`,
					method: 'POST',
				});

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

export class SmartschoolEmailInboxFetch {
	description = require('./SmartschoolEmailInboxFetch.node.json');

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const creds = await this.getCredentials('SmartschoolSessionApi');
		const phpSessId = this.getNodeParameter('phpSessId', 0) as string;

		let mails: any[] = [];

		const fetchInboxCommand = `<request>
							<command>
								<subsystem>postboxes</subsystem>
								<action>message list</action>
								<params>
									<param name="boxType"><![CDATA[inbox]]></param>
									<param name="boxID"><![CDATA[0]]></param>
									<param name="sortField"><![CDATA[date]]></param>
									<param name="sortKey"><![CDATA[desc]]></param>
									<param name="poll"><![CDATA[false]]></param>
									<param name="poll_ids"><![CDATA[]]></param>
									<param name="layout"><![CDATA[new]]></param>
								</params>
							</command>
						</request>`;

		const fetchMoreMailsCommand = `<request>
									<command>
										<subsystem>postboxes</subsystem>
										<action>continue_messages</action>
										<params>
											<param name="boxID"><![CDATA[0]]></param>
											<param name="boxType"><![CDATA[inbox]]></param>
											<param name="layout"><![CDATA[new]]></param>
										</params>
									</command>
								</request>`


		const startMailsJson = await fetchMailWithCommand.call(this, fetchInboxCommand, phpSessId, creds as {domain: string});
		let moreMails = false;

		//console.log(util.inspect(startMailsJson.server.response.actions.action[0].data.messages, {depth: null, colors: true}));

		for (const msg of startMailsJson.server.response.actions.action[0].data.messages.message) {
			console.log(msg);
			mails.push(msg);
			console.log('-----------------------');
		}

		for (const msg of startMailsJson.server.response.actions.action) {
			if (msg.command === "continue_messages"){
				moreMails = true;
			}
		}

		if (moreMails) {
			while (moreMails) {
				moreMails = false;
				console.log('Fetching more mails...');

				const moreMailsJson = await fetchMailWithCommand.call(
					this,
					fetchMoreMailsCommand,
					phpSessId,
					creds as { domain: string },
				);

				for (const msg of moreMailsJson.server.response.actions.action[0].data.messages.message) {
					console.log(msg);
					mails.push(msg);
					console.log('-----------------------');
				}

				for (const msg of moreMailsJson.server.response.actions.action) {
					if (msg.command === 'continue_messages') {
						moreMails = true;
					}
				}
			}
		}

		return [
			this.helpers.returnJsonArray([
				{
					success: true,
					data: mails,
				},
			]),
		];
	}
}
