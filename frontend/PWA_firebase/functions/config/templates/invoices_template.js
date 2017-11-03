var invoicesTemplate = {
  "template" : "invoices_*",
  "order" : 9,
  "settings": {
    "index": {
      "number_of_shards" : 50,
      "number_of_replicas" : 1,
      "analysis": {
        "analyzer": {
              "analyzer_keyword": {
                "type" : "custom",
                "tokenizer": "keyword",
                "filter": "lowercase"
              },
              "standard" : {
                "type": "custom",
                "tokenizer": "standard",
                "filter": ["lowercase","asciifolding"]
              },
              "nGram_analyzer": {
                  "type": "custom",
                  "tokenizer": "whitespace",
                  "filter": [ "lowercase", "asciifolding"]
              },
              "whitespace_analyzer": {
                  "type": "custom",
                  "tokenizer": "whitespace",
                  "filter": ["lowercase", "asciifolding"]
              },
              "custom_index_analyzer": {
                    "type" : "custom",
                    "tokenizer": "standard",
                    "filter": ["standard", "lowercase", "stop", "asciifolding", "porter_stem"]
              },
              "custom_search_analyzer": {
                    "type" : "custom",
                    "tokenizer": "standard",
                    "filter": ["standard", "lowercase", "stop", "asciifolding", "porter_stem"]
              }
        }
      }
    }
  },
  "_default_": {
         "date_detection": false,
         "_all": { "enabled": false },
         "dynamic_templates": [
            {
               "dates_default_template": {
                  "match": ".*Date|date",
                  "match_pattern": "regex",
                  "mapping": {
                     "type": "date",
                     "format": "yyyy-MM-ddTHH:mm:ss.SSSZ",
                     "index": "not_analyzed"
                  }
               }
            }
         ]
  },
  "aliases": { "global_alisas_for_search_invoices_index": {},
               "global_alisas_for_write_invoices_index": {}
             },
  "dynamic_templates":
  [
     {
        "url_feild_template_name":
        {
           "match": "*_url",
           "match_mapping_type": "text",
           "mapping":
           {
              "type": "text",
              "index": "not_analyzed"
           }
        }
     },
     {
        "en_feild_template_name":
        {
           "match": "*_en",
           "match_mapping_type": "text",
           "mapping": { "type": "text", "analyzer": "english" }
        }
     },
     {
        "de_feild_template_name":
        {
           "match": "*_de",
           "match_mapping_type": "text",
           "mapping": { "type": "text", "analyzer": "german" }
        }
     },
     {
        "it_feild_template_name": {
           "match": "*_it",
           "match_mapping_type": "text",
           "mapping": {
              "type": "text",  "analyzer": "italian" }
        }
     },
     {
        "fr_feild_template_name":
        {
           "match": "*_fr",
           "match_mapping_type": "text",
           "mapping": { "type": "text", "analyzer": "french"}
        }
     },
     {
        "es_feild_template_name":
        {
           "match": "*_name",
           "match_mapping_type": "text",
           "mapping": { "type": "text", "analyzer": "spanish" }
        }
     },
     {
       "integers_feild_template_name": {
           "match_mapping_type": "integer",
           "mapping": {
           "type": "double"
           }
       }
     },
     {
        "dates_feild_template_name": {
           "match": ".*Date|date",
           "match_pattern": "regex",
           "mapping": {
              "type": "date"
           }
        }
     },
     {
       "strings_feild_not_analyzed_tname": {
             "match_mapping_type": "text",
             "path_match": "*",
             "mapping": {
                   "type": "text",
                   "fields": { "raw": { "type":  "keyword", "index": "not_analyzed", "ignore_above": 256 } }
                 }
        }
      },
    {
        "text_feild_template_name":
        {
           "match": "*",
           "path_match": "*",
           "match_mapping_type": "text",
           "mapping": { "type": "text", "analyzer": "standard" }
        }
     },
     {
        "wildcard_name_feild_template_name":
        {
           "match": "*_name",
           "match_mapping_type": "text",
           "mapping":
           {
              "type": "text",
              "analyzer": "standard",
              "fields": { "raw": { "type": "keyword", "index": "not_analyzed" } }
           }
        }
     },
     {
        "wildcard_UUID_field_template_name" :
        {
            "match" : "*_guid",
            "match_mapping_type" : "text",
            "mapping" : { "type" : "keyword", "index" : "not_analyzed"}
        }
      }
   ],
  "_index" : {
    "enabled" : true,
    "store" : "yes"
  },
  "_id" : {
    "index" : "not_analyzed",
    "store" : "yes"
  },
  "_all" : {
    "enabled" : "false"
  },
  "dynamic" : "strict",
  "mappings": {
    "base_type" : {
          "date_detection": false,
          "properties"    : {
            "inv_userId_routingAliasId"	:	{ "type" :	"keyword", "index" : true	},
            "inv_supplierId"	:	{ "type" :	"keyword", "index" : true	},
            "inv_supplierDisplayName"	:	{ "type" :	"text"	, "index" : true},
            "inv_company_businessName"	:	{ "type" :	"keyword"	, "index" : true},
            "inv_company_ABN_ACN_LC"	:	{ "type" :	"keyword"	, "index" : true},
            "inv_company_address"	:	{
              "type" : "nested",
              "include_in_parent": true,
              "properties" : {
                      "inv_company_address_streetNumber"	:	{ "type" :	"text", "index" : false	},
                      "inv_company_address_streetName"	:	{ "type" :	"text", "index" : true	},
                      "inv_company_address_streetType"	:	{ "type" :	"text"	, "index" : true},
                      "inv_company_address_suburb"	:	{ "type" :	"keyword"	, "index" : true},
                      "inv_company_address_state"	:	{ "type" :	"keyword"	, "index" : true},
                      "inv_company_address_postcode"	:	{ "type" :	"keyword", "index" : true	},
                      "inv_company_address_country"	:	{ "type" :	"keyword", "index" : true	},
                      "inv_company_address_contact"	:	{ "type" :	"keyword", "index" : true	},
                      "inv_company_address_email"	:	{ "type" :	"keyword", "index" : true	}
                    }
            },
            "inv_company_careOf"	:	{ "type" :	"text", "index" : false	},
            "inv_invoiceDate"	:	{ "type" :	"date", "index" : true	},
            "inv_purchaseOrderNumber"	:	{ "type" :	"keyword", "index" : true	},
            "inv_dateOfService"	:	{ "type" :	"date", "index" : true	},
            "inv_goodsOrServiceDescription"	:	{ "type" :	"text", "index" : true	},
            "inv_TAX_Percentage"	:	{ "type" :	"double", "index" : false	},
            "inv_TAX_amount"	:	{ "type" :	"double"	, "index" : false},
            "inv_TAX_Exemption"	:	{ "type" :	"keyword"	, "index" : false},
            "inv_netAmount"	:	{ "type" :	"double"	, "index" : true},
            "inv_currency"	:	{ "type" :	"keyword"	, "index" : true},
            "inv_discount"	:	{ "type" :	"double"	, "index" : true},
            "inv_creditNotes"	:	{ "type" :	"text"	, "index" : true},
            "inv_BankBSB"	:	{ "type" :	"double"	, "index" : false},
            "inv_BankAccount"	:	{ "type" :	"double"	, "index" : false},
            "inv_BankAccountName"	:	{ "type" :	"keyword"	, "index" : false},
            "inv_isNew"	:	{ "type" :	"boolean"	, "index" : true},
            "inv_isPaid"	:	{ "type" :	"boolean"	, "index" : true},
            "inv_record_created" : { "type" :	"date"	, "index": true },
            "inv_is_record_updated" : { "type" :	"boolean", "index": true },
            "inv_record_updated" : { "type" :	"date"	, "index": true }
          }
        }
  }
};

module.exports = invoicesTemplate;
