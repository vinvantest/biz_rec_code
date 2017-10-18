var settingsTemplate = {
  "template" : "settings-*",
  "order" : 9,
  "settings": {
    "index": {
      "number_of_shards" : 50,
      "number_of_replicas" : 2,
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
  "aliases": { "global_alisas_for_search_settings_index": {},
               "global_alisas_for_write_settings_index": {}
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
                "sett_userId_routingAliasId"	:	{ "type" :	"keyword" , "index": true	},
                "sett_providerName"	:	{ "type" :	"text" , "index": true	},
                "sett_providerAccountId"	:	{ "type" :	"keyword" , "index": true	},
                "sett_providerIdentifier"	:	{ "type" :	"keyword" , "index": true	},
                "sett_issettAccountActive"	:	{ "type" :	"keyword" , "index": true	},
                "sett_issettAccountVerified"	:	{ "type" :	"keyword" , "index": true	},
                "sett_additonalsettNotes"	:	{ "type" :	"text" , "index": false	},
                "sett_refreshInfo"	:	{ "type" :	"text" , "index": false	},
                "sett_refreshInfo_statusCode"	:	{ "type" :	"keyword" , "index": false	},
                "sett_refreshInfo_statusMessage"	:	{ "type" :	"text" , "index": false	},
                "sett_refreshInfo_status"	:	{ "type" :	"keyword", "index": false	},
                "sett_isManual"	:	{ "type" :	"boolean", "index": true	},
                "sett_createdDate"	:	{ "type" :	"date"	, "index": true},
                "sett_lastUpdated"	:	{ "type" :	"boolean"	, "index": true},
                "sett_isAutoRefreshEnabled"	:	{ "type" :	"boolean"	, "index": true},
                "sett_numberOfTransactionDays"	:	{ "type" :	"keyword"	, "index": false},
                "sett_settAccountName"	:	{ "type" :	"text" , "index": true},
                "sett_settAccountNumber"	:	{ "type" :	"long"	, "index": true},
                "sett_BSB"	:	{ "type" :	"integer", "index": true },
                "sett_Branch"	:	{ "type" :	"text"	, "index": true },
                "sett_BranchNumber"	:	{ "type" :	"integer", "index": true },
                "sett_amountDue"	:	{ "type" :	"long"	, "index": false},
                "sett_availableBalance"	:	{ "type" :	"long"	, "index": false},
                "sett_availableCash"	:	{ "type" :	"long"	, "index": false},
                "sett_availableCredit"	:	{ "type" :	"long"	, "index": false},
                "sett_nickname"	:	{ "type" :	"keyword"	, "index": true},
                "sett_status"	:	{ "type" :	"keyword"	, "index": true}
          }
        }
  }
};

module.exports = settingsTemplate;
