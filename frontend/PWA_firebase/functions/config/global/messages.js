var msgConfig = {

	support_contact : 'support@biz-rec.com',
	admin_contact : 'admin@biz-rec.com',

	//ElasticSearch
	elastic_cluster_down: 'System Down (Elasticsearch cluster)! Try again later.',

	//BANKS
	banks_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	banks_invalid_bank_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	banks_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	banks_record_insert_success : 'Banking record inserted Successfully!',
	banks_record_insert_failed : 'Banking record inserted Failed!',
	banks_record_update_success : 'Banking record update Successfully!',
	banks_record_update_failed : 'Banking record update Failed! Old record still exists.',
	banks_record_retrieve_success : 'Banking record retrieved Successfully!',
	banks_record_retrieve_failed : 'Banking record retrieved Failed!',
	banks_duplicate_records : 'New Bank document creation Failed! Duplicate banking records exists. Contact System Adminstrator: ',
	banks_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	banks_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	banks_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',

	//COAS
	coas_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	coas_invalid_coa_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	coas_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	coas_record_insert_success : 'Chart of Accounts record inserted Successfully!',
	coas_record_insert_failed : 'Chart of Accounts record inserted Failed!',
	coas_record_update_success : 'Chart of Accounts record update Successfully!',
	coas_record_update_failed : 'Chart of Accounts record update Failed! Old record still exists.',
	coas_record_retrieve_success : 'Chart of Accounts record retrieved Successfully!',
	coas_record_retrieve_failed : 'Chart of Accounts record retrieved Failed!',
	coas_duplicate_records : 'New Chart of Accounts document creation Failed! Duplicate Chart of Accounts record exists. Contact System Adminstrator: ',
	coas_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	coas_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	coas_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',


	//CUSTOMER
	customers_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	customers_invalid_customer_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	customers_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	customers_record_insert_success : 'Customers record inserted Successfully!',
	customers_record_insert_failed : 'Customers record inserted Failed!',
	customers_record_update_success : 'Customers record update Successfully!',
	customers_record_update_failed : 'Customers record update Failed! Old record still exists.',
	customers_record_retrieve_success : 'Customers record retrieved Successfully!',
	customers_record_retrieve_failed : 'Customers record retrieved Failed!',
	customers_duplicate_records : 'New Customers document creation Failed! Duplicate Customers record exists. Contact System Adminstrator: ',
	customers_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	customers_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	customers_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',

	//INVOICES
	invoices_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	invoices_invalid_invoice_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	invoices_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	invoices_record_insert_success : 'Invoices record inserted Successfully!',
	invoices_record_insert_failed : 'Invoices record inserted Failed!',
	invoices_record_update_success : 'Invoices record update Successfully!',
	invoices_record_update_failed : 'Invoices record update Failed! Old record still exists.',
	invoices_record_retrieve_success : 'Invoices record retrieved Successfully!',
	invoices_record_retrieve_failed : 'Invoices record retrieved Failed!',
	invoices_duplicate_records : 'New Invoices document creation Failed! Duplicate Invoices record exists. Contact System Adminstrator: ',
	invoices_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	invoices_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	invoices_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',

	//PAYMENTS
	payments_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	payments_invalid_payment_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	payments_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	payments_record_insert_success : 'Payments record inserted Successfully!',
	payments_record_insert_failed : 'Payments record inserted Failed!',
	payments_record_update_success : 'Payments record update Successfully!',
	payments_record_update_failed : 'Payments record update Failed! Old record still exists.',
	payments_record_retrieve_success : 'Payments record retrieved Successfully!',
	payments_record_retrieve_failed : 'Payments record retrieved Failed!',
	payments_duplicate_records : 'New Payments document creation Failed! Duplicate Payments record exists. Contact System Adminstrator: ',
	payments_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	payments_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	payments_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',

	//RULES
	rules_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	rules_invalid_rule_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	rules_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	rules_record_insert_success : 'Rules record inserted Successfully!',
	rules_record_insert_failed : 'Rules record inserted Failed!',
	rules_record_update_success : 'Rules record update Successfully!',
	rules_record_update_failed : 'Rules record update Failed! Old record still exists.',
	rules_record_retrieve_success : 'Rules record retrieved Successfully!',
	rules_record_retrieve_failed : 'Rules record retrieved Failed!',
	rules_duplicate_records : 'New Rules document creation Failed! Duplicate Rules record exists. Contact System Adminstrator: ',
	rules_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	rules_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	rules_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',

	//SETTINGS
	settings_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	settings_invalid_setting_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	settings_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	settings_record_insert_success : 'Settings record inserted Successfully!',
	settings_record_insert_failed : 'Settings record inserted Failed!',
	settings_record_update_success : 'Settings record update Successfully!',
	settings_record_update_failed : 'Settings record update Failed! Old record still exists.',
	settings_record_retrieve_success : 'Settings record retrieved Successfully!',
	settings_record_retrieve_failed : 'Settings record retrieved Failed!',
	settings_duplicate_records : 'New Settings document creation Failed! Duplicate Settings record exists. Contact System Adminstrator: ',
	settings_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	settings_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	settings_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',

	//SUPPLIERS
	suppliers_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	suppliers_invalid_supplier_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	suppliers_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	suppliers_record_insert_success : 'Suppliers record inserted Successfully!',
	suppliers_record_insert_failed : 'Suppliers record inserted Failed!',
	suppliers_record_update_success : 'Suppliers record update Successfully!',
	suppliers_record_update_failed : 'Suppliers record update Failed! Old record still exists.',
	suppliers_record_retrieve_success : 'Suppliers record retrieved Successfully!',
	suppliers_record_retrieve_failed : 'Suppliers record retrieved Failed!',
	suppliers_duplicate_records : 'New Suppliers document creation Failed! Duplicate Suppliers record exists. Contact System Adminstrator: ',
	suppliers_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	suppliers_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	suppliers_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: ',

	//TRANSACTIONS
  transactions_invalid_uid : 'System error: User login required. If logged in succesful and still get the errors then contact System Adminstrator: ',
	transactions_invalid_transaction_body : 'System error: Invalid input data. Check your input fields and resubmit. If problem persists then contact system Adminstrator: ',
	transactions_user_not_exists : 'User does not exists in user index! Contact System Adminstrator: ',
	transactions_record_insert_success : 'Transactions record inserted Successfully!',
	transactions_record_insert_failed : 'Transactions record inserted Failed!',
	transactions_record_update_success : 'Transactions record update Successfully!',
	transactions_record_update_failed : 'Transactions record update Failed! Old record still exists.',
	transactions_record_retrieve_success : 'Transactions record retrieved Successfully!',
	transactions_record_retrieve_failed : 'Transactions record retrieved Failed!',
	transactions_duplicate_records : 'New Transactions document creation Failed! Duplicate Transactions record exists. Contact System Adminstrator: ',
	transactions_duplicate_user_found : 'Duplicate user record found in system. Contact System Adminstator: ',
	transactions_user_not_found : 'User not found in System. Contact System Adminstrator: ',
	transactions_user_index_not_exists : 'System config error. Index not exists in backend. Contact System Adminstator: '

};

module.exports = msgConfig;
