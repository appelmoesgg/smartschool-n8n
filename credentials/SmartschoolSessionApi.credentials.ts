import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SmartschoolSessionApi implements ICredentialType {
	name = 'SmartschoolSessionApi';
	displayName = 'Smartschool Session Login';
	properties: INodeProperties[] = [
		{
			displayName: 'Smartschool Domain',
			placeholder: 'school.smartschool.be',
			name: 'domain',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Email (Microsoft Login)',
			name: 'email',
			type: 'string',
			required: true,
			default: '',
		},
		{
			displayName: 'Password (Microsoft Login)',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
		{
			displayName: "Date of Birth (YYYY-MM-DD)",
			placeholder: 'YYYY-MM-DD',
			name: "birthdate",
			type: "dateTime",
			required: true,
			default: '',
		},
	];
}
