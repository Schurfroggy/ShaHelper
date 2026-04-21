-- 武将库：由 import-sgs-warriors-from-md 自 武将技能信息.md 生成
PRAGMA foreign_keys = OFF;
CREATE TABLE IF NOT EXISTS sgs_generals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  skill_count INTEGER NOT NULL DEFAULT 0 CHECK (skill_count >= 0),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sgs_general_skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  general_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_order INTEGER NOT NULL CHECK (skill_order >= 1),
  skill_type_slug TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL,
  UNIQUE(general_id, skill_order)
);
CREATE INDEX IF NOT EXISTS idx_sgs_general_skills_gid ON sgs_general_skills(general_id);

DELETE FROM sgs_general_skills;
DELETE FROM sgs_generals;

-- 界曹植（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界曹植', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '落英', '当其他角色的♣️牌因判定或弃置而进入弃牌堆时，你可以获得之。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '酒诗', '①当你需要使用【酒】时，若你的武将牌正面朝上，你可以翻面，视为使用一张【酒】；

②当你受到伤害后，若此时与你受到此伤害时你的武将牌均背面朝上，你可以翻面；

③当你使用【酒】后，直到你的回合结束，你于出牌阶段内使用【杀】的次数上限+1。', 2, 'normal', 1776688244531);
COMMIT;

-- 界甘宁（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界甘宁', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '奇袭', '出牌阶段，你可以将一张黑色牌当【过河拆桥】使用。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '奋威', '限定技，当一张锦囊牌指定至少两个目标后，你可以令此牌对其中任意名目标角色无效。', 2, 'limited', 1776688244531);
COMMIT;

-- 界夏侯惇（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界夏侯惇', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '刚烈', '当你受到1点伤害后，你可以进行一次判定，若结果为：红色，你对伤害来源造成1点伤害；黑色，你弃置伤害来源的一张牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '清俭', '①每回合限一次，当你于你的摸牌阶段外获得牌后，你可以将任意张手牌扣置于你的武将牌上；
②一名角色的回合结束时，若你的武将牌上有“清俭”牌，你将这些牌交给其他角色，若你以此法交出的牌大于一张，你摸一张牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 曹昂（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('曹昂', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '慷慨', '当一名角色成为【杀】的目标后，若你与其距离1以内，你可以摸一张牌，然后交给其一张牌并展示之。若此牌为装备牌，该角色可以使用此牌。', 1, 'normal', 1776688244531);
COMMIT;

-- 程普（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('程普', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '疠火', '①当你使用普通【杀】时，你可以将此【杀】改为火【杀】，然后此【杀】结算结束后，若此【杀】造成过伤害，你失去1点体力；
②当你使用火【杀】时，你可以多选择一个目标。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '醇醪', '①结束阶段，若你的武将牌上没有“醇”，你可以将任意张【杀】置于你的武将牌上，称为“醇”；
②当一名角色处于濒死状态时，你可以移去一张“醇”，令该角色视为使用一张【酒】。', 2, 'normal', 1776688244531);
COMMIT;

-- 界袁术（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界袁术', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '庸肆', '锁定技，①摸牌阶段，你改为摸X张牌（X为全场势力数）；
②弃牌阶段开始时，你选择一项：1.弃置一张牌；2.失去1点体力。', 1, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '觊玺', '觉醒技，回合结束时，若你于连续三个你的回合内均未失去过体力，你加1点体力上限并回复1点体力，然后选择一项：1.获得技能“妄尊”；2.摸两张牌并获得主公的主公技。', 2, 'awaken', 1776688244531);
COMMIT;

-- 王异（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('王异', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '贞烈', '当你的判定牌生效前，你可以亮出牌堆顶的一张牌，然后你打出此牌代替之。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '秘计', '准备阶段或结束阶段，若你已受伤，你可以进行一次判定，若结果为黑色，你观看牌堆顶的X张牌（X为你已损失的体力值），然后将这些牌交给一名角色。', 2, 'normal', 1776688244531);
COMMIT;

-- 界吕蒙（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界吕蒙', 3, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '克己', '弃牌阶段开始前，若你未于本回合的出牌阶段内使用或打出过【杀】，你可以跳过此阶段。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '勤学', '觉醒技，准备阶段，若你的手牌数大于X（X为你的体力值+3；若游戏人数不小于7则改为+2），你减1点体力上限，然后获得技能“攻心”。', 2, 'awaken', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '攻心', '出牌阶段限一次，你可以观看一名其他角色的手牌，然后你可以展示其中一张♥️牌并选择一项：1.弃置此牌；2.将此牌置于牌堆顶。', 3, 'normal', 1776688244531);
COMMIT;

-- 界刘禅（4）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界刘禅', 4, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '享乐', '锁定技，当你成为一名角色使用【杀】的目标后，该角色选择一项：1.弃置一张基本牌；2.令此【杀】对你无效。', 1, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '放权', '出牌阶段开始前，你可以跳过出牌阶段，令你本回合的手牌上限等于体力上限。若如此做，本回合结束时，你可以弃置一张手牌，令一名其他角色执行一个额外的回合。', 2, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '若愚', '主公技，觉醒技，准备阶段，若你是体力值最小的角色，你加1点体力上限并回复1点体力，然后获得技能“激将”。', 3, 'awaken', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '激将', '主公技，当你需要使用或打出【杀】时，你可以令所有其他蜀势力角色依次选择是否打出一张【杀】，若有角色打出【杀】，视为你使用或打出一张【杀】。', 4, 'lord', 1776688244531);
COMMIT;

-- 荀攸（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('荀攸', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '奇策', '出牌阶段限一次，你可以将所有手牌（至少一张）当任意一张普通锦囊牌使用。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '智愚', '当你受到伤害后，你可以摸一张牌，并展示所有手牌。若你的手牌颜色均相同，伤害来源弃置一张手牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 界赵云（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界赵云', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '龙胆', '你可以将一张【杀】当作【闪】、【闪】当作【杀】使用或打出。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '涯角', '当你于回合外使用或打出手牌时，你可以展示牌堆顶的一张牌并将之交给一名角色，若这两张牌类别不同，你弃置一张牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 界孙坚（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界孙坚', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '英魂', '准备阶段，若你已受伤，你可以选择一名其他角色并选择一项：1.令其摸X张牌，然后其弃置一张牌；2.令其摸一张牌，然后其弃置X张牌。（X为你已损失的体力值）', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '破虏', '当你杀死一名其他角色后或者当你死亡后，你可以令任意名角色各摸X张牌（X为你发动此技能的次数）。', 2, 'normal', 1776688244531);
COMMIT;

-- 界小乔（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界小乔', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '天香', '当你受到伤害时，你可以弃置一张♥️手牌，防止此伤害并选择一名其他角色，若如此做，你选择一项：1.令其受到伤害来源对其造成的1点伤害，然后其摸X张牌（X为其已损失的体力值，且至多为5）；2.令其失去1点体力，然后其获得你弃置的牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '红颜', '锁定技，①你使用，打出，弃置或者交给你的♠️手牌均视为♥️手牌；

②你的♠️判定牌均视为♥️判定牌；

③当一名角色的判定牌生效前，若此牌的判定结果为♥️，你将此牌的判定结果改为由你指定的任意一种花色。', 2, 'locked', 1776688244531);
COMMIT;

-- 界曹操（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界曹操', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '奸雄', '当你受到伤害后，你可以获得对你造成伤害的牌并摸一张牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '护驾', '主公技，当你需要使用或打出【闪】时，你可以令所有其他魏势力角色依次选择是否打出一张【闪】，若有角色打出【闪】，视为你使用或打出一张【闪】。', 2, 'lord', 1776688244531);
COMMIT;

-- 界凌统（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界凌统', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '旋风', '当你于弃牌阶段弃置过至少两张牌，或当你失去装备区里的牌后，你可以选择一项：1.弃置任意名其他角色的共计至多两张牌；2.将一名其他角色装备区里的一张牌移至另一名其他角色的装备区。', 1, 'normal', 1776688244531);
COMMIT;

-- 界荀彧（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界荀彧', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '驱虎', '出牌阶段限一次，你可以与一名体力值大于你的角色拼点，若你：赢，该角色对其攻击范围内你选择的另一名角色造成1点伤害；没赢，该角色对你造成1点伤害。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '节命', '当你受到1点伤害后，你可以令一名角色摸两张牌，然后若该角色的手牌数小于体力上限，你摸一张牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 界魏延（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界魏延', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '狂骨', '当你对一名角色造成1点伤害后，若其扣减体力前你计算与其的距离不大于1，你可以选择一项：1.回复1点体力；2.摸一张牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '奇谋', '限定技，出牌阶段，你可以失去任意点体力，然后你：本回合计算与其他角色的距离-X，本阶段使用【杀】的次数上限+X（X为你以此法失去的体力值）。', 2, 'limited', 1776688244531);
COMMIT;

-- 界许褚（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界许褚', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '裸衣', '摸牌阶段开始时，你亮出牌堆顶的三张牌，然后你可以获得其中的基本牌、武器牌或【决斗】，并放弃摸牌，若如此做，直到你的下个回合开始，你为伤害来源的【杀】或【决斗】造成的基础伤害值+1。', 1, 'normal', 1776688244531);
COMMIT;

-- 界夏侯渊（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界夏侯渊', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '神速', '你可以选择至多三项：1.跳过判定阶段和摸牌阶段；2.跳过出牌阶段并弃置一张装备牌；3.跳过弃牌阶段并翻面。你每选择一项，便视为你使用一张无距离限制的【杀】。', 1, 'normal', 1776688244531);
COMMIT;

-- 曹彰（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('曹彰', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '将驰', '摸牌阶段，你可以选择一项：1.多摸一张牌，然后本回合你不能使用或者打出【杀】；2.少摸一张牌，然后本回合你使用【杀】无距离限制且你可以多使用一张【杀】。', 1, 'normal', 1776688244531);
COMMIT;

-- 界貂蝉（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界貂蝉', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '离间', '出牌阶段限一次，你可以弃置一张牌，依次选择两名男性其他角色，令后者视为对前者使用一张【决斗】。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '闭月', '结束阶段，你可以摸一张牌（若你没有手牌，则你改为摸两张牌）。', 2, 'normal', 1776688244531);
COMMIT;

-- 界华佗（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界华佗', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '急救', '你的回合外，你可以将一张红色牌当【桃】使用。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '青囊', '出牌阶段限一次，你可以弃置一张手牌，令一名角色回复1点体力。若你弃置的牌为红色，你本阶段可以再次发动此技能（每名角色每阶段限一次）。', 2, 'normal', 1776688244531);
COMMIT;

-- 伏皇后（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('伏皇后', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '惴恐', '其他角色的回合开始时，若你已受伤，你可以与其拼点，若你：赢，该角色本回合不能对除其以外的角色使用牌；没赢，其本回合计算与你的距离视为1。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '求援', '当你成为其他角色使用【杀】的目标时，你可以令另一名其他角色选择一项：1.交给你一张【闪】；2.也成为此【杀】的目标。', 2, 'normal', 1776688244531);
COMMIT;

-- 界曹丕（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界曹丕', 3, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '行殇', '当其他角色死亡时，你可以选择一项：1.获得其所有牌；2.回复1点体力。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '放逐', '当你受到伤害后，你可以令一名其他角色选择一项：1.摸X张牌并翻面；2.弃置X张牌并失去1点体力。（X为你已损失的体力值）', 2, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '颂威', '主公技，当其他魏势力角色的黑色判定牌生效后，该角色可以令你摸一张牌。', 3, 'lord', 1776688244531);
COMMIT;

-- 界伊籍（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界伊籍', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '机捷', '出牌阶段限一次，你可以观看牌堆底的一张牌，然后将此牌交给任意一名角色。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '急援', '当一名角色进入濒死状态时，或当你交给一名其他角色牌时，你可以令其摸一张牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 界庞统（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界庞统', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '连环', '①出牌阶段，你可以将一张♣️手牌当【铁索连环】使用或重铸；
②当你使用【铁索连环】时，你可以额外指定一个目标。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '涅槃', '限定技，出牌阶段，或当你处于濒死状态时，你可以弃置你区域里所有的牌，摸三张牌，将体力值回复至3点，复原武将牌。', 2, 'limited', 1776688244531);
COMMIT;

-- 虞翻（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('虞翻', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '纵玄', '当你的牌因弃置而置入弃牌堆时，你可以将其中任意张牌置于牌堆顶。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '直言', '结束阶段，你可以令一名角色摸一张牌并展示之，若此牌为装备牌，其使用此牌并回复1点体力。', 2, 'normal', 1776688244531);
COMMIT;

-- 界吕布（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界吕布', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '无双', '锁定技，①当你使用【杀】指定一名角色为目标后，其需连续使用两张【闪】才能抵消；

②当你使用【决斗】指定其他角色为目标后，或成为其他角色使用【决斗】的目标后，其每次响应需连续打出两张【杀】。', 1, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '利驭', '当你使用【杀】对其他角色造成伤害后，你可以获得其区域内的一张牌，若你获得的牌不为装备牌，则其摸一张牌，否则视为你对该角色指定的另一名其他角色使用一张【决斗】。', 2, 'normal', 1776688244531);
COMMIT;

-- 鲁芝（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('鲁芝', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '清忠', '出牌阶段开始时，你可以摸两张牌，然后本阶段结束时，你与一名全场手牌数最少的角色交换手牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '卫境', '每轮限一次，当你需要使用【杀】或【闪】时，你可以视为使用一张普通【杀】或【闪】。', 2, 'normal', 1776688244531);
COMMIT;

-- 界马超（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界马超', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '马术', '锁定技，你计算与其他角色的距离-1。', 1, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '铁骑', '当你使用【杀】指定一名角色为目标后，你可以令其所有非锁定技失效直到回合结束，然后你进行一次判定，除非该角色弃置一张与判定结果花色相同的牌，否则其不能使用【闪】响应此【杀】。', 2, 'normal', 1776688244531);
COMMIT;

-- 马岱（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('马岱', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '马术', '锁定技，你计算与其他角色的距离-1。', 1, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '潜袭', '当你使用【杀】对距离为1的目标角色造成伤害时，你可以进行一次判定，若结果不为♥️，你防止此伤害，然后该角色减1点体力上限。', 2, 'normal', 1776688244531);
COMMIT;

-- 朱然（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('朱然', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '胆守', '出牌阶段，你可以弃置X张牌，并选择你攻击范围内的一名其他角色（X为你本阶段发动此技能的次数），若X：为1，你弃置该角色的一张牌；为2，该角色交给你一张牌；为3，你对其造成1点伤害；不小于4，你与其各摸两张牌。', 1, 'normal', 1776688244531);
COMMIT;

-- 界关羽（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界关羽', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '武圣', '①你可以将一张红色牌当【杀】使用或打出；②你使用♦️【杀】无距离限制。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '义绝', '出牌阶段限一次，你可以弃置一张牌，令一名其他角色展示一张手牌，若此牌为：【红色】你获得此牌且你可以令其回复1点体力；【黑色】其所有非锁定技失效且不能使用或打出手牌、你使用♥️【杀】对其造成的伤害+1。', 2, 'normal', 1776688244531);
COMMIT;

-- 界刘表（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界刘表', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '自守', '摸牌阶段，你可以多摸X张牌（X为全场势力数），然后本回合你不能对其他角色使用牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '宗室', '锁定技，①你的手牌上限+X（X为全场势力数）；②准备阶段，若你的手牌数大于体力值，你本回合使用【杀】无次数限制。', 2, 'locked', 1776688244531);
COMMIT;

-- 界张辽（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界张辽', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '突袭', '摸牌阶段，你可以少摸任意张牌，然后获得等量名其他角色的各一张手牌。', 1, 'normal', 1776688244531);
COMMIT;

-- 凌操（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('凌操', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '独进', '摸牌阶段，你可以多摸X+1张牌（X为你装备区里牌数的一半，向下取整）。', 1, 'normal', 1776688244531);
COMMIT;

-- 界张飞（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界张飞', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '咆哮', '锁定技，①你使用【杀】无次数限制；②若你于出牌阶段内使用过【杀】，你本阶段使用【杀】无距离限制。', 1, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '厉勇', '锁定技，出牌阶段，当你使用的【杀】被【闪】抵消后，则你本阶段使用的下一张【杀】指定的目标本回合非锁定技失效；此【杀】不可被响应且伤害值+1；此【杀】造成伤害后，若目标角色未死亡，你失去1点体力。', 2, 'locked', 1776688244531);
COMMIT;

-- 简雍（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('简雍', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '巧说', '出牌阶段开始时，你可以与一名角色拼点，若你：赢，本阶段你使用下一张基本牌或普通锦囊牌时可以为此牌增加或减少一个目标；没赢，本阶段你不能使用锦囊牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '纵适', '当你拼点结束后，若你赢，则你可以获得两张拼点牌中点数较小的一张，否则你可以收回你拼点的牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 界孙尚香（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界孙尚香', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '结姻', '出牌阶段限一次，你可以选择一名男性角色，然后你弃置一张手牌或将一张装备牌置入其装备区。若如此做，你与其之中体力值较高的角色摸一张牌，体力值较低的角色回复1点体力。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '枭姬', '当你失去装备区里的一张牌后，你可以摸两张牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 界张角（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界张角', 3, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '雷击', '当你使用或打出【闪】时，你可以令一名其他角色进行一次判定，若结果为♠️，你对其造成2点雷电伤害；♣️，你回复1点体力并对其造成1点雷电伤害。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '鬼道', '当一名角色的判定牌生效前，你可以打出一张黑色牌替换之。', 2, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '黄天', '主公技，其他群势力角色的出牌阶段限一次，该角色可以交给你一张【闪】或【闪电】。', 3, 'lord', 1776688244531);
COMMIT;

-- 廖化（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('廖化', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '当先', '锁定技，回合开始时，你执行一个额外的出牌阶段。', 1, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '伏枥', '限定技，当你处于濒死状态时，你可以将体力回复至X点（X为全场势力数），然后你翻面。', 2, 'limited', 1776688244531);
COMMIT;

-- 郭淮（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('郭淮', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '精策', '出牌阶段结束时，若你本阶段使用过的牌数不小于你的体力值，你可以摸两张牌。', 1, 'normal', 1776688244531);
COMMIT;

-- 公孙瓒（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('公孙瓒', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '趫猛', '当你使用黑色【杀】对一名角色造成伤害后，你可以选择其装备区里的一张牌，若此牌：为坐骑牌，你获得之；不为坐骑牌，你弃置之。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '义从', '锁定技，①若你的体力值大于2，你计算与其他角色的距离-1；②若你的体力值不大于2，其他角色计算与你的距离+1。', 2, 'locked', 1776688244531);
COMMIT;

-- 朱灵（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('朱灵', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '战意', '出牌阶段限一次，你可以弃置一张牌，本阶段根据弃置的牌的类别获得对应效果，然后失去1点体力：基本牌，你可以将一张基本牌当任意一张基本牌使用、你使用的下一张基本牌伤害值或回复值+1；锦囊牌，你摸三张牌、你使用的锦囊牌不能被【无懈可击】响应；装备牌，当你使用【杀】指定一名角色为唯一目标后，该角色弃置两张牌，且你选择并获得其中的一张牌。', 1, 'normal', 1776688244531);
COMMIT;

-- 潘璋马忠（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('潘璋马忠', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '夺刀', '当你受到【杀】造成的伤害后，你可以弃置一张牌，获得伤害来源装备区里的武器牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '暗箭', '锁定技，当你使用【杀】对目标角色造成伤害时，若你不在其攻击范围内，此伤害+1。', 2, 'locked', 1776688244531);
COMMIT;

-- 曹冲（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('曹冲', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '称象', '当你受到伤害后，你可以亮出牌堆顶的四张牌，获得其中任意张点数之和不大于13的牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '仁心', '当其他角色受到伤害时，若其体力值为1，你可以翻面并弃置一张装备牌，防止此伤害。', 2, 'normal', 1776688244531);
COMMIT;

-- 李丰（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('李丰', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '屯储', '摸牌阶段，若你的武将牌上没有“粮”，你可以多摸两张牌，然后你可以将任意张手牌置于你的武将牌上，称为“粮”（当你的武将牌上有“粮”时，你不能使用【杀】）。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '输粮', '一名角色的结束阶段，若该角色的手牌数小于体力值，你可以移去一张“粮”，令其摸两张牌。', 2, 'normal', 1776688244531);
COMMIT;

-- 界吴国太（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界吴国太', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '甘露', '出牌阶段限一次，你可以令两名装备区里的牌数之差不大于X的角色交换装备区里的牌（若选择的角色包含你，则X无限，否则X为你已损失的体力值）。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '补益', '当一名角色进入濒死状态时，你可以展示该角色的一张手牌，然后若此牌不为基本牌，其弃置此牌并回复1点体力。', 2, 'normal', 1776688244531);
COMMIT;

-- 界孙策（5）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界孙策', 5, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '激昂', '当你使用【决斗】或红色【杀】指定目标后，或成为【决斗】或红色【杀】的目标后，你可以摸一张牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '魂姿', '觉醒技，准备阶段，若你的体力值小于3，你减1点体力上限，获得技能「英姿」和「英魂」。', 2, 'awaken', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '制霸', '主公技，其他吴势力角色的出牌阶段限一次，该角色可以与你拼点（若你已觉醒，你可以拒绝此拼点），若其没赢，你可以获得拼点的两张牌。', 3, 'lord', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '英姿', '锁定技，①摸牌阶段，你多摸一张牌；②你的手牌上限等于X（X为你的体力上限）。（觉醒后获得）', 4, 'locked', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '英魂', '准备阶段，若你已受伤，你可以选择一名其他角色并选择一项：1.令其摸X张牌，然后其弃置一张牌；2.令其摸一张牌，然后其弃置X张牌。（X为你已损失的体力值）（觉醒后获得）', 5, 'normal', 1776688244531);
COMMIT;

-- 韩当（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('韩当', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '弓骑', '出牌阶段限一次，你可以弃置一张牌，令你本阶段的攻击范围无限，然后若此牌为装备牌，你可以弃置一名其他角色的一张牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '解烦', '限定技，出牌阶段，你可以选择一名角色，令所有攻击范围内含有其的角色依次选择一项：1.弃置一张武器牌；2.令其摸一张牌。', 2, 'limited', 1776688244531);
COMMIT;

-- 关兴张苞（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('关兴张苞', 3, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '父魂', '摸牌阶段，你可以改为亮出牌堆顶的两张牌并获得之，然后若这两张牌颜色不同，你本回合视为拥有技能「武圣」和「咆哮」。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '武圣', '（发动「父魂」后）你可以将一张红色牌当【杀】使用或打出。', 2, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '咆哮', '锁定技，（发动「父魂」后）你使用【杀】无次数限制。', 3, 'locked', 1776688244531);
COMMIT;

-- 界司马懿（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界司马懿', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '反馈', '当你受到1点伤害后，你可以获得伤害来源的一张牌。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '鬼才', '当一名角色的判定牌生效前，你可以打出一张牌代替之。', 2, 'normal', 1776688244531);
COMMIT;

-- 刘封（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('刘封', 1, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '陷嗣', '①准备阶段，你可以将至多两名角色的各一张牌置于你的武将牌上，称为“逆”；②当一名角色需要对你使用【杀】时，其可以移去两张“逆”，视为对你使用一张普通【杀】。', 1, 'normal', 1776688244531);
COMMIT;

-- 界孙权（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界孙权', 2, 1776688244531, 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '制衡', '出牌阶段限一次，你可以弃置任意张牌，然后摸等量的牌（若你以此法弃置了所有的手牌，则多摸一张牌）。', 1, 'normal', 1776688244531);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '救援', '主公技，当其他吴势力角色对自己使用【桃】时，若其体力值大于你，该角色可以改为令你回复1点体力，然后其摸一张牌。', 2, 'lord', 1776688244531);
COMMIT;

-- 界颜良文丑（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界颜良文丑', 1, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '双雄', '摸牌阶段，你可以改为展示牌堆顶的两张牌，然后你选择并获得其中一张。若如此做，本回合你可以将任意一张与以此法获得的牌颜色不同的手牌当【决斗】使用，然后当你受到此牌造成的伤害后，你可以获得对方打出的所有【杀】。', 1, 'normal', 1776688244532);
COMMIT;

-- 界徐盛（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界徐盛', 1, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '破军', '①当你使用【杀】指定一名角色为目标后，你可以将该角色的至多X张牌置于其武将牌上（X为该角色的体力值），然后当前回合结束时，其获得武将牌上的牌；②当你使用【杀】对手牌数与装备区里的牌数均不大于你的目标角色造成伤害时，此伤害+1。', 1, 'normal', 1776688244532);
COMMIT;

-- 界卧龙诸葛（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界卧龙诸葛', 3, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '八阵', '锁定技，当你装备区没有防具牌时，你视为装备着【八卦阵】。', 1, 'locked', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '火计', '出牌阶段，你可以将一张红色牌当【火攻】使用。', 2, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '看破', '你可以将一张黑色牌当【无懈可击】使用。', 3, 'normal', 1776688244532);
COMMIT;

-- 界甄姬（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界甄姬', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '洛神', '准备阶段，你可以进行一次判定，若结果为黑色，你获得此牌并可以重复此流程（以此法获得的牌不计入你本回合的手牌上限）。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '倾国', '你可以将一张黑色手牌当【闪】使用或打出。', 2, 'normal', 1776688244532);
COMMIT;

-- 界孟获（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界孟获', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '祸首', '锁定技，①【南蛮入侵】对你无效；②当其他角色使用【南蛮入侵】指定目标后，你代替其成为此牌的伤害来源。', 1, 'locked', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '再起', '弃牌阶段结束时，你可以令至多X名角色（X为本回合置入弃牌堆的红色牌数）各选择一项：1.摸一张牌；2.令你回复1点体力。', 2, 'normal', 1776688244532);
COMMIT;

-- 界典韦（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界典韦', 1, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '强袭', '出牌阶段，你可以失去1点体力或弃置一张武器牌，对你攻击范围内的一名其他角色造成1点伤害（每名角色每阶段限一次）。', 1, 'normal', 1776688244532);
COMMIT;

-- 界高顺（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界高顺', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '陷阵', '出牌阶段限一次，你可以与一名角色拼点，若你：赢，你本阶段无视该角色的防具且对其使用牌无距离与次数限制；没赢，你本阶段不能使用【杀】；拼点的牌为【杀】，本回合【杀】不计入你的手牌上限。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '禁酒', '锁定技，①你的【酒】只能当普通【杀】使用或打出；②当你受到【杀】造成的伤害时，此伤害-X（X为影响此【杀】的【酒】的张数）；③你的回合内，其他角色不能使用【酒】。', 2, 'locked', 1776688244532);
COMMIT;

-- 界于吉（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界于吉', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '蛊惑', '每回合限一次，你可以扣置一张手牌，将此牌当任意一张基本牌或普通锦囊牌使用或打出。此时，其他角色可以进行质疑。一旦有其他角色质疑则翻开此牌，若此牌为：假，此牌作废；真，质疑角色获得技能「缠怨」。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '缠怨', '锁定技，①你不能质疑「蛊惑」；②当你的体力值为1时，你的所有其他技能失效。', 2, 'locked', 1776688244532);
COMMIT;

-- 界曹仁（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界曹仁', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '据守', '结束阶段，你可以摸四张牌并翻面，然后弃置一张手牌（若此牌为装备牌，你改为使用之）。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '解围', '①你可以将装备区里的一张牌当【无懈可击】使用；②当你的武将牌从背面翻至正面时，你可以弃置一张手牌，移动场上的一张牌。', 2, 'normal', 1776688244532);
COMMIT;

-- 步练师（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('步练师', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '安恤', '出牌阶段限一次，你可以选择两名手牌数不相等的其他角色，令手牌数大的一方交给另一方一张手牌，然后若双方手牌数相等，你摸一张牌或回复1点体力。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '追忆', '当你死亡时，你可以令一名其他角色（杀死你的角色除外）摸三张牌并回复1点体力。', 2, 'normal', 1776688244532);
COMMIT;

-- 界华雄（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界华雄', 1, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '耀武', '锁定技，当你受到【杀】造成的伤害时，若此【杀】为红色，则伤害来源回复1点体力或摸一张牌，否则你摸一张牌。', 1, 'locked', 1776688244532);
COMMIT;

-- 界周瑜（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界周瑜', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '英姿', '锁定技，①摸牌阶段，你多摸一张牌；②你的手牌上限等于X（X为你的体力上限）。', 1, 'locked', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '反间', '出牌阶段限一次，你可以展示一张手牌并交给一名其他角色，然后令其选择一项：1.展示所有手牌，弃置与此牌花色相同的所有牌；2.失去1点体力。', 2, 'normal', 1776688244532);
COMMIT;

-- 界姜维（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界姜维', 3, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '挑衅', '出牌阶段限一次，你可以令一名其他角色选择一项：1.若你在其攻击范围内，对你使用一张【杀】；2.令你弃置其一张牌。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '志继', '觉醒技，准备阶段，若你没有手牌，你选择一项：1.回复1点体力；2.摸两张牌。若如此做，你减1点体力上限，获得技能「观星」。', 2, 'awaken', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '观星', '准备阶段，你可以观看牌堆顶的五张牌（当存活角色数小于4时改为三张），然后将这些牌以任意顺序置于牌堆顶或牌堆底。若你将这些牌均置于牌堆底，你可以于结束阶段再次「观星」。（觉醒后获得）', 3, 'normal', 1776688244532);
COMMIT;

-- 界刘备（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界刘备', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '仁德', '出牌阶段，你可以交给一名本阶段未获得过「仁德」牌的其他角色任意张手牌，然后若你此次给出了本阶段的第二张「仁德」牌，你可以视为使用一张基本牌（以此法使用的虚拟【杀】有距离限制）。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '激将', '主公技，当你需要使用或打出【杀】时，你可以令所有其他蜀势力角色依次选择是否打出一张【杀】，若有角色打出【杀】，视为你使用或打出一张【杀】。', 2, 'lord', 1776688244532);
COMMIT;

-- 李儒（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('李儒', 3, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '绝策', '结束阶段，你可以对一名没有手牌的其他角色造成1点伤害。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '灭计', '出牌阶段限一次，你可以将一张黑色锦囊牌置于牌堆顶并选择一名有牌的其他角色，然后你令其选择一项：1.弃置一张锦囊牌；2.依次弃置两张非锦囊牌（不足则全弃）。', 2, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '焚城', '限定技，出牌阶段，你可以令所有其他角色依次选择一项：1.弃置至少X张牌（X为上一名此技能的目标因此弃置的牌数+1）；2.受到2点火焰伤害。', 3, 'limited', 1776688244532);
COMMIT;

-- 界黄月英（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界黄月英', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '集智', '当你使用一张普通锦囊牌时，你可以摸一张牌，若此牌是基本牌，你可以弃置此牌，令你本回合的手牌上限+1。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '奇才', '锁定技，①你使用锦囊牌无距离限制；②当其他角色弃置你装备区里的防具牌和宝物牌时，取消之。', 2, 'locked', 1776688244532);
COMMIT;

-- 界法正（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界法正', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '眩惑', '摸牌阶段，你可以改为令一名其他角色摸两张牌，然后令该角色选择一项：1.对其攻击范围内你选择的另一名角色使用一张【杀】；2.令你获得其两张牌。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '恩怨', '①当你一次性获得一名其他角色的至少两张牌后，你可以令其摸一张牌；②当你受到1点伤害后，你可以令伤害来源选择一项：1.交给你一张手牌；2.失去1点体力。', 2, 'normal', 1776688244532);
COMMIT;

-- 界邓艾（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界邓艾', 3, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '屯田', '当你于回合外失去牌时，你可以进行一次判定，若结果为♥️，则你获得此判定牌，否则你将此判定牌置于你的武将牌上，称为「田」（你计算与其他角色的距离时减去「田」的数量）。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '凿险', '觉醒技，准备阶段，若「田」的数量不小于3，你减1点体力上限，然后获得技能「急袭」。', 2, 'awaken', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '急袭', '出牌阶段，你可以将一张「田」当【顺手牵羊】使用。（觉醒后获得）', 3, 'normal', 1776688244532);
COMMIT;

-- 界徐晃（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界徐晃', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '断粮', '①你可以将一张黑色非锦囊牌当【兵粮寸断】使用；②你对手牌数不小于你的其他角色使用【兵粮寸断】无距离限制。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '截辎', '锁定技，当一名其他角色跳过摸牌阶段后，你摸一张牌。', 2, 'locked', 1776688244532);
COMMIT;

-- 界黄忠（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界黄忠', 1, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '烈弓', '①你对你计算与其距离不大于你的【杀】点数的其他角色使用此【杀】无距离限制；②当你使用【杀】指定一名角色为目标后，你可以根据下列条件执行相应的效果：1.若你的手牌数不小于其手牌数，该角色不能响应此【杀】；2.若你的体力值不大于其体力值，此【杀】对其造成的基础伤害+1。', 1, 'normal', 1776688244532);
COMMIT;

-- 界祝融（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界祝融', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '巨象', '锁定技，①【南蛮入侵】对你无效；②当其他角色使用的【南蛮入侵】结算结束后置入弃牌堆时，你获得之。', 1, 'locked', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '烈刃', '当你使用【杀】指定一名角色为目标后，你可以与其拼点，若你：赢，你获得该角色的一张牌；没赢，你与其交换双方拼点的牌。', 2, 'normal', 1776688244532);
COMMIT;

-- 界张昭张纮（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界张昭张纮', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '直谏', '①出牌阶段，你可以将手牌中的一张装备牌置入一名其他角色的装备区（不可替换原装备），然后摸一张牌；②当你于出牌阶段内使用装备牌时，你摸一张牌。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '固政', '其他角色的弃牌阶段结束时，你可以将此阶段内因弃置而置入弃牌堆的一张牌交给该角色，然后你可以获得本阶段内其余因弃置而置入弃牌堆的牌。', 2, 'normal', 1776688244532);
COMMIT;

-- 界蔡文姬（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界蔡文姬', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '悲歌', '当一名角色受到【杀】造成的伤害后，你可以弃置一张牌，令其进行一次判定，若结果为：♥️，其回复X点体力（X为此次伤害的伤害值）；♦️，其摸三张牌；♣️，伤害来源弃置两张牌；♠️，伤害来源翻面。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '断肠', '锁定技，当你死亡时，杀死你的角色失去所有武将技能。', 2, 'locked', 1776688244532);
COMMIT;

-- 界黄盖（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界黄盖', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '苦肉', '出牌阶段限一次，你可以弃置一张牌，然后失去1点体力。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '诈降', '锁定技，当你失去1点体力后，你摸三张牌，然后若此时是你的出牌阶段，本阶段你：使用红色【杀】无距离限制、使用红色【杀】不能被【闪】响应、使用【杀】的次数上限+1。', 2, 'locked', 1776688244532);
COMMIT;

-- 界郭嘉（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界郭嘉', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '天妒', '当你的判定牌生效后，你可以获得之。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '遗计', '当你受到1点伤害后，你可以摸两张牌，然后你可以将至多两张手牌分配给其他角色。', 2, 'normal', 1776688244532);
COMMIT;

-- 关平（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('关平', 1, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '龙吟', '当一名角色于其出牌阶段内使用【杀】时，你可以弃置一张牌，令此【杀】不计入次数，然后若此【杀】为红色，你摸一张牌。', 1, 'normal', 1776688244532);
COMMIT;

-- 界陆逊（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界陆逊', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '谦逊', '当一张延时锦囊牌或其他角色使用的普通锦囊牌对你生效时，若你是此牌的唯一目标，你可以将所有手牌置于你的武将牌上，然后你于回合结束时获得这些牌。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '连营', '当你失去手牌后，若你没有手牌，你可以令至多X名角色各摸一张牌（X为你此次失去的手牌数）。', 2, 'normal', 1776688244532);
COMMIT;

-- 钟会（3）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('钟会', 3, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '权计', '当你受到1点伤害后，你可以摸一张牌并将一张手牌置于你的武将牌上，称为「权」（你的手牌上限增加「权」的数量）。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '自立', '觉醒技，准备阶段，若「权」的数量不小于3，你选择一项：1.回复1点体力；2.摸两张牌。若如此做，你减1点体力上限，获得技能「排异」。', 2, 'awaken', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '排异', '出牌阶段限一次，你可以移去一张「权」，令一名角色摸两张牌，然后若该角色的手牌数大于你，你对其造成1点伤害。（觉醒后获得）', 3, 'normal', 1776688244532);
COMMIT;

-- 界董卓（4）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界董卓', 4, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '酒池', '①你可以将一张♠️手牌当【酒】使用；②当你使用【酒】【杀】造成伤害后，本回合「崩坏」失效。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '肉林', '锁定技，当你使用【杀】指定女性角色为目标后/成为女性角色使用【杀】的目标后，该角色/你需连续使用两张【闪】才能抵消。', 2, 'locked', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '崩坏', '锁定技，结束阶段，若你不是全场体力值最低的角色，你选择一项：1.失去1点体力；2.减1点体力上限。', 3, 'locked', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '暴虐', '主公技，当其他群势力角色造成伤害后，其可以进行一次判定，若结果为♠️，你回复1点体力。', 4, 'lord', 1776688244532);
COMMIT;

-- 界于禁（1）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界于禁', 1, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '节钺', '结束阶段，你可以交给一名其他角色一张牌，令其选择一项：1.选择一张手牌和一张装备区里的牌，然后弃置其余的牌；2.令你摸三张牌。', 1, 'normal', 1776688244532);
COMMIT;

-- 马良（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('马良', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '自书', '锁定技，①其他角色的结束阶段结束时，你将本回合获得的牌置入弃牌堆；
②你的回合内，当你不因此技能获得牌时，你摸一张牌。', 1, 'locked', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '应援', '当你于回合内使用牌结算结束置入弃牌堆时，你可以将之交给一名其他角色（每种牌名的牌每回合限一次）。', 2, 'normal', 1776688244532);
COMMIT;

-- 界朱桓（2）
BEGIN TRANSACTION;
INSERT INTO sgs_generals (name, skill_count, created_at, updated_at) VALUES ('界朱桓', 2, 1776688244532, 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '奋励', '若你的手牌数/体力值/装备区里的牌数（装备区里须有牌）为全场最大，你可以跳过摸牌阶段/出牌阶段/弃牌阶段。', 1, 'normal', 1776688244532);
INSERT INTO sgs_general_skills (general_id, skill_name, description, skill_order, skill_type_slug, created_at)
       VALUES ((SELECT MAX(id) FROM sgs_generals), '平寇', '回合结束时，你可以对至多X名其他角色各造成1点伤害（X为你本回合跳过的阶段数），然后你随机获得牌堆中的一张装备牌。', 2, 'normal', 1776688244532);
COMMIT;

