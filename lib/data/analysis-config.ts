export type ZoneMember = {
  ctpvCd: string;
  ctpvName: string;
  sggCd: string;
  sggName: string;
};

export type ZoneDefinition = {
  zoneId: string;
  zoneName: string;
  zoneGroup: "seoul" | "gyeonggi";
  sortOrder: number;
  members: ZoneMember[];
};

export const sangilStation = {
  stationId: "sangil-5-551",
  stationName: "상일동역",
  lineName: "5호선",
  operatorName: "서울교통공사",
  zoneName: "강동·송파",
  cityDo: "서울특별시",
  sigungu: "강동구"
} as const;

export const sangilLivingZone = {
  scopeType: "living_zone" as const,
  scopeLabel: "상일동 생활권",
  focusAreaLabel: "서울특별시 강동구 상일동",
  description:
    "공개 OD API가 역 단위가 아니라 읍면동 기반이므로, 상일동 생활권(상일동)을 기준으로 대중교통 이동을 해석합니다."
};

export const sangilStationScope = {
  scopeType: "station" as const,
  scopeLabel: "상일동역",
  focusAreaLabel: "서울특별시 강동구",
  description: "서울 승하차 API에서 확인된 상일동역(5호선) 역 단위 승하차 추세입니다."
};

export const zoneDefinitions: ZoneDefinition[] = [
  {
    zoneId: "seoul-east-southeast",
    zoneName: "강동·송파",
    zoneGroup: "seoul",
    sortOrder: 1,
    members: [
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11740", sggName: "강동구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11710", sggName: "송파구" }
    ]
  },
  {
    zoneId: "seoul-gangnam",
    zoneName: "강남·서초",
    zoneGroup: "seoul",
    sortOrder: 2,
    members: [
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11680", sggName: "강남구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11650", sggName: "서초구" }
    ]
  },
  {
    zoneId: "seoul-core",
    zoneName: "도심(종로·중구·용산)",
    zoneGroup: "seoul",
    sortOrder: 3,
    members: [
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11110", sggName: "종로구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11140", sggName: "중구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11170", sggName: "용산구" }
    ]
  },
  {
    zoneId: "seoul-northeast",
    zoneName: "동북",
    zoneGroup: "seoul",
    sortOrder: 4,
    members: [
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11200", sggName: "성동구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11215", sggName: "광진구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11230", sggName: "동대문구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11260", sggName: "중랑구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11290", sggName: "성북구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11305", sggName: "강북구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11320", sggName: "도봉구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11350", sggName: "노원구" }
    ]
  },
  {
    zoneId: "seoul-northwest",
    zoneName: "서북",
    zoneGroup: "seoul",
    sortOrder: 5,
    members: [
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11380", sggName: "은평구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11410", sggName: "서대문구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11440", sggName: "마포구" }
    ]
  },
  {
    zoneId: "seoul-southwest",
    zoneName: "서남",
    zoneGroup: "seoul",
    sortOrder: 6,
    members: [
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11470", sggName: "양천구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11500", sggName: "강서구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11530", sggName: "구로구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11545", sggName: "금천구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11560", sggName: "영등포구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11590", sggName: "동작구" },
      { ctpvCd: "11", ctpvName: "서울특별시", sggCd: "11620", sggName: "관악구" }
    ]
  },
  {
    zoneId: "gyeonggi-east",
    zoneName: "하남·구리·남양주",
    zoneGroup: "gyeonggi",
    sortOrder: 7,
    members: [
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41450", sggName: "하남시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41310", sggName: "구리시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41360", sggName: "남양주시" }
    ]
  },
  {
    zoneId: "gyeonggi-southeast",
    zoneName: "성남·광주·이천·여주·양평",
    zoneGroup: "gyeonggi",
    sortOrder: 8,
    members: [
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41130", sggName: "성남시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41610", sggName: "광주시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41500", sggName: "이천시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41670", sggName: "여주시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41830", sggName: "양평군" }
    ]
  },
  {
    zoneId: "gyeonggi-south",
    zoneName: "용인·수원·화성·오산·평택·안성",
    zoneGroup: "gyeonggi",
    sortOrder: 9,
    members: [
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41460", sggName: "용인시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41110", sggName: "수원시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41590", sggName: "화성시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41370", sggName: "오산시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41220", sggName: "평택시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41550", sggName: "안성시" }
    ]
  },
  {
    zoneId: "gyeonggi-southwest",
    zoneName: "안양·군포·의왕·과천·광명·부천",
    zoneGroup: "gyeonggi",
    sortOrder: 10,
    members: [
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41170", sggName: "안양시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41410", sggName: "군포시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41430", sggName: "의왕시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41290", sggName: "과천시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41210", sggName: "광명시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41190", sggName: "부천시" }
    ]
  },
  {
    zoneId: "gyeonggi-west",
    zoneName: "시흥·안산",
    zoneGroup: "gyeonggi",
    sortOrder: 11,
    members: [
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41390", sggName: "시흥시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41270", sggName: "안산시" }
    ]
  },
  {
    zoneId: "gyeonggi-northwest",
    zoneName: "고양·파주·김포",
    zoneGroup: "gyeonggi",
    sortOrder: 12,
    members: [
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41280", sggName: "고양시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41480", sggName: "파주시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41570", sggName: "김포시" }
    ]
  },
  {
    zoneId: "gyeonggi-north",
    zoneName: "의정부·양주·동두천·포천·연천·가평",
    zoneGroup: "gyeonggi",
    sortOrder: 13,
    members: [
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41150", sggName: "의정부시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41630", sggName: "양주시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41250", sggName: "동두천시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41650", sggName: "포천시" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41800", sggName: "연천군" },
      { ctpvCd: "41", ctpvName: "경기도", sggCd: "41820", sggName: "가평군" }
    ]
  }
];

export const zoneNames = zoneDefinitions.map((zone) => zone.zoneName);
