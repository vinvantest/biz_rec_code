var config = {
	consumer_key : 'YOU_CONSUMER_KEY',
	consumer_secret : 'YOUR_CONSUMER_SECRET',
	access_token : 'YOUR_ACCESS_TOKEN',
	access_token_secret : 'YOUR_ACCESS_TOKEN_SECRET',

	email_app_name: 'BizRec',
	email_service: 'gmail',
	email_host: 'smtp.gmail.com',
	email_auth_user: 'ramhanse@gmail.com',
	email_auth_pass: 'ramhanse1',
	email_from: 'BizRec <customerservice@bizrec.com>',
	email_cc: 'ramhanse@gmail.com',
	email_customer_service: 'customerservice@bizrec.com',

	email_sendgrid_apikey: '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',
	email_sendgrid_apikey_template: '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',
	email_welcome_template_id: '209b701b-0921-4ef4-aa94-3d5d9d93d617',
	email_bye_template_id : '8457a373-65ae-4bcd-827f-76c2497605a6',

	index_base_type: 'base_type',

	user_index_search_alias_name : 'global_alisas_for_search_users_index',
	user_index_write_alias_name : 'global_alisas_for_write_users_index',

	user_index_name: 'users_index_v1',

	banks_index_name: 'banks_index_v1',
	banks_alias_token_read: '_banks_read',
	banks_alias_token_write: '_banks_write',
	banks_routing_column_name: 'bank_userId_routingAliasId',

	coas_index_name: 'coas_index_v1',
	coas_alias_token_read: '_coa_read',
	coas_alias_token_write: '_coa_write',
	coas_routing_column_name: 'coa_userId_routingAliasId',

	customers_index_name: 'customers_index_v1',
	customers_alias_token_read: '_customers_read',
	customers_alias_token_write: '_customers_write',
	customers_routing_column_name: 'cust_userId_routingAliasId',

	invoices_index_name: 'invoices_index_v1',
	invoices_alias_token_read: '_invoices_read',
	invoices_alias_token_write: '_invoices_write',
	invoices_routing_column_name: 'inv_userId_routingAliasId',

	notes_index_name: 'notes_index_v1',
	notes_alias_token_read: '_notes_read',
	notes_alias_token_write: '_notes_write',
	notes_routing_column_name: 'note_userId_routingAliasId',

	payments_index_name: 'payments_index_v1',
	payments_alias_token_read: '_payments_read',
	payments_alias_token_write: '_payments_write',
	payments_routing_column_name: 'pymt_userId_routingAliasId',

	rules_index_name: 'rules_index_v1',
	rules_alias_token_read: '_rules_read',
	rules_alias_token_write: '_rules_write',
	rules_routing_column_name: 'rule_userId_routingAliasId',

	suppliers_index_name: 'suppliers_index_v1',
	suppliers_alias_token_read: '_suppliers_read',
	suppliers_alias_token_write: '_suppliers_write',
	suppliers_routing_column_name: 'supp_userId_routingAliasId',

	transactions_index_name: 'transactions_index_v1',
	transactions_alias_token_read: '_transactions_read',
	transactions_alias_token_write: '_transactions_write',
	transactions_routing_column_name: 'tran_userId_routingAliasId',

	settings_index_name: 'settings_index_v1',
	settings_alias_token_read: '_settings_read',
	settings_alias_token_write: '_settings_write',
	settings_routing_column_name: 'sett_userId_routingAliasId'

};

module.exports = config;
