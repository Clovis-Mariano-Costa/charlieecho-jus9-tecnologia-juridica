import assert from "node:assert/strict";
import test from "node:test";
import { parseJobRequest, fingerprintJobRequest, reconcileDuplicate, publicJobState, jobPollPath, JOB_STATUSES } from "../functions/lib/async-job-contract.js";

const input={message:"  exemplo sintético  ",mode:"social",requestId:"s52-001"};
test("aceita somente envelope sem efeito",()=>{
  const r=parseJobRequest(input);
  assert.equal(r.ok,true);
  assert.equal(r.value.message,"exemplo sintético");
  assert.equal(r.value.process_effect,"none");
  assert.deepEqual(JOB_STATUSES,["queued","running","succeeded","failed","expired","reconciliation_required"]);
});
test("rejeita entrada inválida e pedidos de efeito",()=>{
  for(const v of [null,{}, {...input,message:""}, {...input,message:"x".repeat(8001)}, {...input,requestId:"bad id"}, {...input,mode:"root"}, {...input,process_effect:"write"}, {...input,driveSaver:{}}, {...input,route:{}}, {...input,artifact:{}}]){
    assert.equal(parseJobRequest(v).ok,false);
  }
});
test("hash normalizado estável e divergência causa reconciliação",async()=>{
  const a=parseJobRequest(input).value, b=parseJobRequest({...input,message:"exemplo sintético"}).value;
  const h=await fingerprintJobRequest(a);
  assert.equal(h,await fingerprintJobRequest(b));
  assert.match(h,/^[a-f0-9]{64}$/);
  assert.equal(reconcileDuplicate({payload_hash:h,job_id:"job-1",status:"queued"},h).ok,true);
  const different=await fingerprintJobRequest({...b,message:"outra mensagem"});
  assert.equal(reconcileDuplicate({payload_hash:h,job_id:"job-1",status:"queued"},different).status,"reconciliation_required");
});
test("estado público omite campos privados e respostas não concluídas",()=>{
  const secret={job_id:"job-1",status:"queued",answer:"não disponível",token:"never-include",payload_hash:"private"};
  assert.deepEqual(publicJobState(secret),{job_id:"job-1",status:"queued",process_effect:"none"});
  assert.deepEqual(publicJobState({...secret,status:"failed",error_code:"upstream_timeout"}),{job_id:"job-1",status:"failed",process_effect:"none",error_code:"upstream_timeout"});
  assert.equal(publicJobState({...secret,status:"unknown"}),null);
  assert.equal(publicJobState({...secret,job_id:"../leak"}),null);
  assert.deepEqual(publicJobState({...secret,status:"succeeded",answer:"OK"}),{job_id:"job-1",status:"succeeded",process_effect:"none",answer:"OK"});
  assert.equal(jobPollPath("job-1"),"/api/ia/jobs/job-1");
  assert.equal(jobPollPath("../admin"),null);
});
