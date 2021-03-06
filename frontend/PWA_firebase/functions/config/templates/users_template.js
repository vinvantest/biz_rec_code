var userTemplate = {
  "template" : "users_*",
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
  "aliases": { "global_alisas_for_search_users_index": {},
               "global_alisas_for_write_users_index": {}
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
            "usr_uid": {"type": "keyword", "index": true},
            "usr_displayName" : {"type" : "text" , "index" : true	},
            "usr_firstName" : { "type" : "keyword" , "index" : true	},
            "usr_familyName" : { "type" : "keyword", "index" : true	 },
            "usr_middleName" : { "type" : "keyword", "index" : true	 },
            "usr_emailVerified" : { "type": "boolean", "index" : true},
            "usr_phoneNumber": { "type": "text", "index": false},
            "usr_photoURL" : { "type": "text", "index": false },
            "usr_dob" : { "type" : "date" , "index" : true	},
            "usr_gender" : { "type" : "keyword" , "index" : true	},
            "usr_email" : { "type" : "keyword" , "index" : true	},
            "usr_company" : {
              "type" : "nested",
              "include_in_parent": true,
              "properties" : {
                        "company_businessName" : { "type" : "keyword", "index" : true	},
                        "company_ABN_ACN_LC" : { "type" : "keyword" , "index" : true	},
                        "company_contact" : {"type" : "keyword" , "index" : true	},
                        "company__email" : {"type" : "keyword", "index" : true	 },
                        "company_address" :
                          {
                          "type" : "nested",
                          "include_in_parent": true,
                          "properties" :
                              {
                                    "company_address_streetNumber" : { "type" : "text" , "index" : false	},
                                    "company_address_streetName" : {"type" : "text" , "index" : false	},
                                    "company_address_streetType" : {"type" : "text" , "index" : false	},
                                    "company_address_suburb" : {"type" : "keyword" , "index" : true	},
                                    "company_address_state" : {"type" : "keyword" , "index" : true	},
                                    "company_address_postcode" : {"type" : "keyword", "index" : true	 },
                                    "company_address_country" : {"type" : "keyword", "index" : true	 }
                              }
                        }
                      }
                    },
            "usr_url" : {"type" : "text", "index" : false	 },
            "usr_locale" : {"type" : "keyword" , "index" : true	},
            "usr_currency" : {"type" : "keyword" , "index" : true	},
            "usr_isSubscritionActive" : { "type" : "boolean" , "index" : true	},
            "usr_isNotified" : { "type" : "boolean", "index" : true	},
            "usr_subscriptionType": { "type" : "keyword" , "index" : true	},
            "usr_subscriptionAmount" : {"type" : "double", "index" : true	},
            "usr_subscriptionCostToDate" : { "type" : "double", "index" : true	},
            "usr_subscriptionFrequency": { "type" : "double" , "index" : true	},
            "usr_isUserCloudConnected" : { "type" : "boolean", "index" : true	},
            "usr_isDropBox" : { "type" : "boolean", "index" : true	},
            "usr_isGoogle": { "type" : "boolean", "index" : true	},
            "usr_isBox" : { "type" : "boolean", "index" : true	},
            "usr_isICloud" : { "type" : "boolean", "index" : true	},
            "usr_isOneDrive" : { "type" : "boolean", "index" : true	},
            "usr_invoicePaymentBankBSB" : { "type" : "double" , "index" : true	},
            "usr_invoicePaymentBankAccountNumber": { "type" : "double" , "index" : true	},
            "usr_invoicePaymentBankAccountName" : { "type" : "keyword" , "index" : true	},
            "usr_invoicePaymentBankName" : { "type" : "text" , "index" : true	},
            "usr_record_created" : { "type" :	"date"	, "index": true },
            "usr_is_record_updated" : { "type" :	"boolean", "index": true },
            "usr_record_updated" : { "type" :	"date"	, "index": true }
          }
        }
  }
};

module.exports = userTemplate;
