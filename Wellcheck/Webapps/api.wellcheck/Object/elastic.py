from elasticsearch import Elasticsearch


es = Elasticsearch(["http://elasticsearch:9200"])
try:
    es.indices.create(index = 'point_test')
except:
    try:
        es.indices.refresh(index="point_test")
    except:
        print("Missing 'point_test' index in elasticsearch")
