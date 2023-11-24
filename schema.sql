-- RUN 3rd after running the scripts
create or replace function docs_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  title text,
  sha text,
  repo text,
  owner text,
  chunk text,
  content text,
  ref text,
  path text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    docs.id,
    docs.title,
    docs.sha,
    docs.repo,
    docs.owner,
    docs.chunk,
    docs.content,
    docs.ref,
    docs.path,
    1 - (docs.embedding <=> query_embedding) as similarity
  from docs
  where 1 - (docs.embedding <=> query_embedding) > similarity_threshold
  order by docs.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on docs 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
