-- AlterTable
CREATE SEQUENCE level_id_seq;
ALTER TABLE "Level" ALTER COLUMN "id" SET DEFAULT nextval('level_id_seq');
ALTER SEQUENCE level_id_seq OWNED BY "Level"."id";

-- AlterTable
CREATE SEQUENCE problemtag_id_seq;
ALTER TABLE "ProblemTag" ALTER COLUMN "id" SET DEFAULT nextval('problemtag_id_seq');
ALTER SEQUENCE problemtag_id_seq OWNED BY "ProblemTag"."id";

-- AlterTable
CREATE SEQUENCE tag_id_seq;
ALTER TABLE "Tag" ALTER COLUMN "id" SET DEFAULT nextval('tag_id_seq');
ALTER SEQUENCE tag_id_seq OWNED BY "Tag"."id";
