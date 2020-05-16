-- noinspection SqlNoDataSourceInspectionForFile

CREATE TABLE IF NOT EXISTS COVER(
    ID UUID NOT NULL,
    HEIGHT INTEGER,
    URL VARCHAR(255),
    WIDTH INTEGER,

    PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS TAG(
    ID UUID NOT NULL,
    NAME VARCHAR(255),

    PRIMARY KEY(ID),
    UNIQUE(NAME)
);

CREATE TABLE IF NOT EXISTS PODCAST(
    ID UUID NOT NULL,
    DESCRIPTION VARCHAR(65535),
    HAS_TO_BE_DELETED BOOLEAN,
    LAST_UPDATE TIMESTAMP WITH TIME ZONE,
    SIGNATURE VARCHAR(255),
    TITLE VARCHAR(255),
    TYPE VARCHAR(255),
    URL VARCHAR(65535),
    COVER_ID UUID,

    PRIMARY KEY(ID),
    FOREIGN KEY(COVER_ID) REFERENCES COVER(ID),
    UNIQUE(URL)
);

CREATE TABLE IF NOT EXISTS ITEM(
    ID UUID NOT NULL,
    CREATION_DATE TIMESTAMP WITH TIME ZONE,
    DESCRIPTION TEXT,
    DOWNLOAD_DATE TIMESTAMP WITH TIME ZONE,
    FILE_NAME VARCHAR(255),
    LENGTH BIGINT,
    MIME_TYPE VARCHAR(255),
    NUMBER_OF_FAIL INTEGER,
    PUB_DATE TIMESTAMP WITH TIME ZONE,
    STATUS VARCHAR(255),
    TITLE VARCHAR(254) NOT NULL,
    URL VARCHAR(65535),
    COVER_ID UUID,
    PODCAST_ID UUID,

    PRIMARY KEY(ID),
    FOREIGN KEY(PODCAST_ID) REFERENCES PODCAST(ID),
    FOREIGN KEY(COVER_ID) REFERENCES COVER(ID),
    UNIQUE(PODCAST_ID, URL)
);

CREATE TABLE IF NOT EXISTS PODCAST_TAGS(
    PODCASTS_ID UUID NOT NULL,
    TAGS_ID UUID NOT NULL,

    PRIMARY KEY(PODCASTS_ID, TAGS_ID),
    FOREIGN KEY(TAGS_ID) REFERENCES TAG(ID),
    FOREIGN KEY(PODCASTS_ID) REFERENCES PODCAST(ID)
);

CREATE TABLE IF NOT EXISTS WATCH_LIST(
    ID UUID NOT NULL,
    NAME VARCHAR(255),

    PRIMARY KEY(ID),
    UNIQUE(NAME)
);          

CREATE TABLE IF NOT EXISTS WATCH_LIST_ITEMS(
    WATCH_LISTS_ID UUID NOT NULL,
    ITEMS_ID UUID NOT NULL,

    PRIMARY KEY(WATCH_LISTS_ID, ITEMS_ID),
    FOREIGN KEY(ITEMS_ID) REFERENCES ITEM(ID),
    FOREIGN KEY(WATCH_LISTS_ID) REFERENCES WATCH_LIST(ID)
);

CREATE INDEX IF NOT EXISTS ITEM_TITLE ON ITEM(TITLE);
CREATE INDEX IF NOT EXISTS ITEM_PUB_DATE_DESC ON ITEM(PUB_DATE DESC);
CREATE INDEX IF NOT EXISTS ITEM_PUB_DATE_ASC ON ITEM(PUB_DATE);
CREATE INDEX IF NOT EXISTS ITEM_DOWNLOAD_DATE_ASC ON ITEM(DOWNLOAD_DATE);
CREATE INDEX IF NOT EXISTS ITEM_DOWNLOAD_DATE_DESC ON ITEM(DOWNLOAD_DATE DESC);

