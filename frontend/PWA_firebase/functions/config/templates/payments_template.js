var paymentsTemplate = {
  "template" : "payments_*",
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
  "aliases": { "global_alisas_for_search_payments_index": {},
               "global_alisas_for_write_payments_index": {}
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
           "type": "long"
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
              "pymt_userId_routingAliasId"	:	{ "type" :	"keyword", "index" : true	},
              "pymt_displayName"	:	{ "type" :	"text", "index" : true		},
              "pymt_supplierId"	:	{ "type" :	"keyword", "index" : true		},
              "pymt_supplier_companyName"	:	{ "type" :	"text", "index" : true	 },
              "pymt_supplier_familyName"	:	{ "type" :	"text", "index" : true		},
              "pymt_supplier_givenName"	:	{ "type" :	"text"	, "index" : true	},
              "pymt_supplier.email"	:	{ "type" :	"keyword", "index" : true		},
              "pymt_totalPaymentAmount"	:	{ "type" :	"double", "index" : true	 },
              "pymt_taxAmount"	:	{ "type" :	"double", "index" : true		},
              "pymt_taxType"	:	{ "type" :	"keyword"	, "index" : true	},
              "pymt_datePaymentMade"	:	{ "type" :	"date"	, "index" : true	},
              "pymt_paymentType"	:	{ "type" :	"keyword", "index" : true		},
              "pymt_coaExpenseCategory"	:	{ "type" :	"keyword", "index" : true		},
              "pymt_currency"	:	{ "type" :	"keyword", "index" : true		},
              "pymt_discount"	:	{ "type" :	"double"	, "index" : true	},
              "pymt_isReceiptAttached"	:	{ "type" :	"boolean", "index" : true		},
              "pymt_paymentNote"	:	{ "type" :	"text", "index" : true	 },
              "pymt_isPartialPayment"	:	{ "type" :	"boolean"	, "index" : true	},
              "pymt_partialPaymentAmount"	:	{ "type" :	"double" , "index" : false	},
              "pymt_record_created" : { "type" :	"date"	, "index": true },
              "pymt_is_record_updated" : { "type" :	"boolean", "index": true },
              "pymt_record_updated" : { "type" :	"date"	, "index": true }
          }
    }
  }
};

module.exports = paymentsTemplate;
