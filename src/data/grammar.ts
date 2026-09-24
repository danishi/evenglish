import type { GrammarTopic } from './types'

/**
 * 日本人がつまずきやすい文法トピック。
 * 1ページはグラスの1画面（本文7行）に収まる長さにしている。
 */
export const GRAMMAR: GrammarTopic[] = [
  {
    id: 'g01',
    title: '冠詞 a と the',
    pages: [
      'a: 相手がまだ特定できない「ある1つ」\nthe: お互いに「どれか分かる」もの\n\nI saw a cat. The cat was black.\n猫を見た。その猫は黒かった。',
      '1回目は a、2回目からは the が基本。\n\n世界に1つのものも the:\nthe sun / the internet\n\n数えられない名詞や複数形の総称には何もつけない:\nI like music. / Dogs are cute.',
      'よくある間違い:\n× I play the soccer.\n○ I play soccer.\n× I go to the school by the bus.\n○ I go to school by bus.\n\nスポーツ・交通手段・食事名には冠詞なし',
    ],
    quiz: [
      { q: 'I have ___ idea.', choices: ['an', 'a', 'the', '(なし)'], answer: 0, explain: '母音で始まる idea には an' },
      { q: 'Look at ___ moon!', choices: ['the', 'a', 'an', '(なし)'], answer: 0, explain: '1つしかない月には the' },
      { q: "Let's play ___ tennis.", choices: ['(なし)', 'a', 'the', 'an'], answer: 0, explain: 'スポーツ名に冠詞はつけない' },
      { q: "She's ___ honest person.", choices: ['an', 'a', 'the', '(なし)'], answer: 0, explain: '発音が母音で始まる honest には an' },
      { q: 'I usually go to ___ bed at 11.', choices: ['(なし)', 'the', 'a', 'an'], answer: 0, explain: 'go to bed（寝る）は冠詞なし' },
    ],
  },
  {
    id: 'g02',
    title: '現在完了形',
    pages: [
      'have + 過去分詞\n「過去の出来事が今とつながっている」\n\nI lost my key.\n鍵をなくした（今は不明）\nI have lost my key.\n鍵をなくしてしまった（今もない）',
      '3つの使い方\n完了: I have just finished.\n  ちょうど終わった\n経験: I have been to Canada.\n  カナダに行ったことがある\n継続: I have lived here for 5 years.\n  5年住んでいる',
      '注意: 明確な過去の時点とは一緒に使えない\n\n× I have seen him yesterday.\n○ I saw him yesterday.\n\nyesterday / last week / ago → 過去形',
    ],
    quiz: [
      { q: 'I ___ to Kyoto three times.', choices: ['have been', 'went', 'have gone', 'am going'], answer: 0, explain: '経験は have been to' },
      { q: 'She ___ the report yesterday.', choices: ['finished', 'has finished', 'have finished', 'finishing'], answer: 0, explain: 'yesterday は過去形と使う' },
      { q: 'We ___ each other since 2015.', choices: ['have known', 'knew', 'know', 'are knowing'], answer: 0, explain: 'since + 起点 → 継続の現在完了' },
      { q: '___ you ever eaten sushi?', choices: ['Have', 'Did', 'Do', 'Are'], answer: 0, explain: '経験をたずねる → Have you ever' },
      { q: 'I ___ here for three years.', choices: ['have worked', 'work', 'worked', 'am working'], answer: 0, explain: 'for + 期間で今も続く → 現在完了' },
    ],
  },
  {
    id: 'g03',
    title: '前置詞 in / on / at',
    pages: [
      '時間の in / on / at\nat: 時刻・一点  at 7:00, at night\non: 日付・曜日  on Monday, on May 5\nin: 月・年・季節  in May, in 2026\n\n範囲が広いほど in',
      '場所の in / on / at\nat: 地点  at the station\non: 接触面  on the wall, on the table\nin: 空間の中  in the box, in Tokyo\n\nat the door ドアのところで\non the door ドアに(貼って)',
      '乗り物\nin a car / in a taxi（中に座る）\non a bus / on a train / on a plane\n（立って歩ける大きさ）\n\n例外的な言い方\nin the morning / on the weekend(米)',
    ],
    quiz: [
      { q: 'The meeting starts ___ 3 p.m.', choices: ['at', 'on', 'in', 'by'], answer: 0, explain: '時刻の一点は at' },
      { q: "I'll see you ___ Friday.", choices: ['on', 'at', 'in', 'for'], answer: 0, explain: '曜日は on' },
      { q: 'I got ___ the train.', choices: ['on', 'in', 'at', 'to'], answer: 0, explain: '電車・バスは on' },
      { q: 'I was born ___ 1998.', choices: ['in', 'on', 'at', 'by'], answer: 0, explain: '年は in' },
      { q: "There's a picture ___ the wall.", choices: ['on', 'in', 'at', 'to'], answer: 0, explain: '壁に接している → on' },
    ],
  },
  {
    id: 'g04',
    title: '数えられる/られない名詞',
    pages: [
      '日本語にない区別。数えられない名詞は a がつかず複数形にもならない。\n\n数えられない例:\nwater, money, information,\nadvice, furniture, homework,\nnews, luggage, work',
      '量の表し方\n数えられる: many / a few\n  many books, a few books\n数えられない: much / a little\n  much water, a little water\nどちらにも使える:\n  a lot of / some / any',
      'よくある間違い\n× many informations\n○ a lot of information\n\n× I have a homework.\n○ I have some homework.',
      '数えたい時は「入れ物」を使う\na piece of advice アドバイス1つ\na glass of water 水1杯\ntwo pieces of luggage 荷物2つ',
    ],
    quiz: [
      { q: 'Can you give me some ___?', choices: ['advice', 'advices', 'an advice', 'advicing'], answer: 0, explain: 'advice は数えられない' },
      { q: 'How ___ money do you have?', choices: ['much', 'many', 'few', 'lot'], answer: 0, explain: 'money は数えられない → much' },
      { q: 'I have ___ friends in Osaka.', choices: ['a few', 'a little', 'much', 'a'], answer: 0, explain: 'friends は数えられる → a few' },
      { q: 'I need ___ information.', choices: ['some', 'an', 'many', 'a few'], answer: 0, explain: 'information は数えられない' },
      { q: 'There are ___ people here.', choices: ['a lot of', 'much', 'a little', 'an'], answer: 0, explain: 'people は数えられる複数' },
    ],
  },
  {
    id: 'g05',
    title: '不定詞と動名詞',
    pages: [
      'to不定詞: これから・未来志向\n動名詞(-ing): すでに・実際にしたこと\n\nwant / decide / hope / plan\n→ to do\nenjoy / finish / mind / avoid\n→ doing',
      '意味が変わる動詞\nI remember locking the door.\n鍵をかけたのを覚えている(過去)\nRemember to lock the door.\n忘れずに鍵をかけて(未来)',
      'stop も意味が変わる\nstop smoking\nたばこをやめる\nstop to smoke\nたばこを吸うために立ち止まる',
      'よくある間違い\n× I enjoyed to talk with you.\n○ I enjoyed talking with you.\n\n× I look forward to see you.\n○ I look forward to seeing you.\n（この to は前置詞）',
    ],
    quiz: [
      { q: 'I finished ___ the book.', choices: ['reading', 'to read', 'read', 'reads'], answer: 0, explain: 'finish は動名詞をとる' },
      { q: 'She decided ___ abroad.', choices: ['to study', 'studying', 'study', 'studied'], answer: 0, explain: 'decide は to不定詞をとる' },
      { q: "Don't forget ___ me.", choices: ['to call', 'calling', 'call', 'called'], answer: 0, explain: 'これからすること → to' },
      { q: 'I enjoy ___ with friends.', choices: ['talking', 'to talk', 'talk', 'talked'], answer: 0, explain: 'enjoy は動名詞をとる' },
      { q: 'I want ___ Hawaii someday.', choices: ['to visit', 'visiting', 'visit', 'visited'], answer: 0, explain: 'want は to不定詞をとる' },
    ],
  },
  {
    id: 'g06',
    title: '助動詞のニュアンス',
    pages: [
      '「〜すべき」の強さ\nhad better > must > should\n\nshould: 〜した方がいい(提案)\nmust: 〜しなければ(話し手の判断)\nhad better: しないとまずいぞ\n※目上の人に had better は失礼',
      'must と have to\nmust: 自分がそう思う\nhave to: 状況・ルールでそうなる\n\n否定で意味が大きく変わる!\nYou must not go. 行ってはいけない\nYou don\'t have to go. 行かなくていい',
      '丁寧さの段階\nCan you ...? 〜できる？\nCould you ...? 〜していただけますか\nWould you mind -ing?\n〜していただいても構いませんか\n\n過去形にすると丁寧になる',
    ],
    quiz: [
      { q: "You ___ come if you're busy.", choices: ["don't have to", 'must not', 'should', 'had better'], answer: 0, explain: '「来なくてもいい」は don\'t have to' },
      { q: '___ you open the window?', choices: ['Would', 'Must', 'Should', 'Had'], answer: 0, explain: '丁寧な依頼は Would/Could you' },
      { q: 'You ___ smoke here. It\'s illegal.', choices: ['must not', "don't have to", 'need not', 'may'], answer: 0, explain: '禁止は must not' },
      { q: "It's late. You ___ go home.", choices: ['should', 'must not', 'may not', "don't have to"], answer: 0, explain: '「〜したほうがいい」は should' },
      { q: '___ I use your phone?', choices: ['May', 'Must', 'Should', 'Would'], answer: 0, explain: '許可を求める → May / Can I' },
    ],
  },
  {
    id: 'g07',
    title: '比較',
    pages: [
      '比較級: 〜より…\nshort → shorter / big → bigger\n長い語は more: more expensive\n\n最上級: 一番…\nthe shortest / the most expensive',
      '不規則に変化する語\ngood - better - best\nbad - worse - worst\nmany / much - more - most',
      '同じくらい: as ... as\nHe is as tall as me.\n否定は「〜ほど…ない」\nIt\'s not as hot as yesterday.\n昨日ほど暑くない\n倍数: twice as big as\n〜の2倍の大きさ',
      '比較級の強調\nmuch / far / a lot + 比較級\nThis is much better.\nずっと良い\n\n× very better\n○ much better',
      'the 比較級, the 比較級\n「〜すればするほど…」\n\nThe sooner, the better.\n早ければ早いほどいい',
    ],
    quiz: [
      { q: 'This one is ___ than that one.', choices: ['cheaper', 'more cheap', 'cheapest', 'cheap'], answer: 0, explain: '短い語は -er' },
      { q: "She's ___ better at math now.", choices: ['much', 'very', 'more', 'most'], answer: 0, explain: '比較級の強調は much' },
      { q: 'Tokyo is ___ as Osaka.', choices: ['not as quiet', 'not quiet', 'not quieter', 'not so quieter'], answer: 0, explain: 'not as ... as で「〜ほど…でない」' },
      { q: "This is the ___ movie I've seen.", choices: ['best', 'better', 'good', 'most good'], answer: 0, explain: 'good の最上級は best' },
      { q: 'Please speak more ___.', choices: ['slowly', 'slow', 'slower', 'slowest'], answer: 0, explain: '動詞を説明するのは副詞 → more slowly' },
    ],
  },
  {
    id: 'g08',
    title: '受動態',
    pages: [
      'be + 過去分詞「〜される」\n\nSomeone stole my bike.\n→ My bike was stolen.\n自転車が盗まれた\n\n誰がやったかより「何がどうなったか」を伝えたい時に使う',
      'by を省くのが普通\nThis bridge was built in 1990.\n(誰が建てたかは重要でない)\n\n感情は受け身で表す\nI\'m interested in art. 美術に興味がある\nI was surprised at the news.',
      '進行形・完了形の受け身\nThe room is being cleaned.\n掃除されているところ\nThe email has been sent.\nメールは送信済み',
      '助動詞 + be + 過去分詞\nIt can be done by Monday.\n月曜までにできます\nIt must be finished today.\n今日中に終わらせなければならない',
    ],
    quiz: [
      { q: 'English ___ in many countries.', choices: ['is spoken', 'speaks', 'is speaking', 'spoke'], answer: 0, explain: '言語は「話される」→ is spoken' },
      { q: "I'm very ___ in history.", choices: ['interested', 'interesting', 'interest', 'interests'], answer: 0, explain: '人が興味を持つ → interested' },
      { q: 'The package ___ yesterday.', choices: ['was delivered', 'delivered', 'is delivered', 'has delivered'], answer: 0, explain: '過去の受け身 was + 過去分詞' },
      { q: 'This bridge ___ in 1990.', choices: ['was built', 'built', 'is built', 'has build'], answer: 0, explain: '過去の受け身 was + 過去分詞' },
      { q: 'The window was broken ___ Tom.', choices: ['by', 'with', 'from', 'of'], answer: 0, explain: '「誰によって」は by' },
    ],
  },
  {
    id: 'g09',
    title: '関係代名詞',
    pages: [
      '名詞に後ろから説明を足す\n人: who  物: which  両方: that\nI have a friend who lives in Paris.\nパリに住んでいる友達がいる\nThis is the book that I bought.\nこれは私が買った本だ',
      '目的格は省略できる\nThe movie (that) I saw was great.\n私が見た映画は良かった\n\n会話では省略が普通',
      'whose: 所有「〜の」\nI know a girl whose father is a pilot.\n父親がパイロットの女の子を知っている',
      'カンマあり=補足説明\nMy sister, who lives in Kobe, is a nurse.\n（姉は1人。ちなみに神戸在住）\n\nwhat = the thing(s) which\nWhat I want is time.\n私が欲しいのは時間だ',
    ],
    quiz: [
      { q: 'The man ___ called you is my boss.', choices: ['who', 'which', 'what', 'whose'], answer: 0, explain: '人が主語 → who' },
      { q: "That's not ___ I meant.", choices: ['what', 'that', 'which', 'who'], answer: 0, explain: '「〜すること」は what' },
      { q: 'I lost the watch ___ he gave me.', choices: ['that', 'who', 'what', 'whose'], answer: 0, explain: '物 → that / which' },
      { q: 'I have a friend ___ father is a doctor.', choices: ['whose', 'who', 'which', 'that'], answer: 0, explain: '「その人の〜」は whose' },
      { q: 'This is the book ___ changed my life.', choices: ['that', 'who', 'what', 'where'], answer: 0, explain: '物が主語 → that / which' },
    ],
  },
  {
    id: 'g10',
    title: '仮定法',
    pages: [
      '現実と違うことは時制を1つ過去へ\nIf I had time, I would go.\n時間があれば行くのに\n（実際は時間がない）\n\nbe動詞は were が基本\nIf I were you, ... 私があなたなら',
      '過去の反対: 仮定法過去完了\nIf I had known, I would have told you.\n知っていたら伝えたのに\n\nwish も同じルール\nI wish I could speak French.\nフランス語が話せたらなあ',
      '丁寧表現にも使われる\nI would like to ...\n〜したいのですが\nWould it be possible to ...?\n〜は可能でしょうか\n\n仮定の距離感=丁寧さ',
    ],
    quiz: [
      { q: 'If I ___ rich, I would travel.', choices: ['were', 'am', 'be', 'will be'], answer: 0, explain: '仮定法過去 → were' },
      { q: 'I wish I ___ a car.', choices: ['had', 'have', 'will have', 'having'], answer: 0, explain: 'wish + 過去形' },
      { q: 'If I had left early, I ___ the bus.', choices: ["would've caught", 'would catch', 'caught', 'will catch'], answer: 0, explain: '過去の反対 → would have + 過去分詞' },
      { q: 'If I ___ you, I would ask her.', choices: ['were', 'am', 'was being', 'will be'], answer: 0, explain: 'If I were you（私があなたなら）' },
      { q: "If it ___ tomorrow, we'll stay home.", choices: ['rains', 'will rain', 'rained', 'would rain'], answer: 0, explain: '現実に起こりうる条件は現在形' },
    ],
  },
  {
    id: 'g11',
    title: '使役 make / let / have / get',
    pages: [
      '「人に〜させる」\nmake 人 do: 無理にさせる\nlet 人 do: 許してさせる\nhave 人 do: 頼んでしてもらう\nget 人 to do: 説得してしてもらう',
      'My boss made me work late.\n上司に残業させられた\nLet me know.\n知らせてね\nI\'ll have him call you.\n彼に折り返し電話させます',
      'have + 物 + 過去分詞\n「〜してもらう」\nI had my hair cut.\n髪を切ってもらった\n※ I cut my hair. は自分で切った',
      'have + 物 + 過去分詞\n「〜される」（被害）\nI had my wallet stolen.\n財布を盗まれた',
    ],
    quiz: [
      { q: 'Please ___ me know.', choices: ['let', 'make', 'get', 'take'], answer: 0, explain: 'Let me know. 知らせて' },
      { q: 'I had my car ___.', choices: ['repaired', 'repair', 'to repair', 'repairing'], answer: 0, explain: 'have + 物 + 過去分詞' },
      { q: 'I got him ___ me.', choices: ['to help', 'help', 'helped', 'helping'], answer: 0, explain: 'get 人 to do' },
      { q: 'My boss made me ___ late.', choices: ['work', 'to work', 'working', 'worked'], answer: 0, explain: 'make 人 + 動詞の原形' },
      { q: 'I need to get my hair ___.', choices: ['cut', 'cutting', 'to cut', 'cuts'], answer: 0, explain: 'get + 物 + 過去分詞（cut は同形）' },
    ],
  },
  {
    id: 'g12',
    title: '間接疑問文',
    pages: [
      '疑問文を文の中に入れると「普通の語順」に戻る\n\nWhere is the station?\n→ Do you know where the station is?\n\nWhat time is it?\n→ Could you tell me what time it is?',
      'do / does / did は消える\nWhere does he live?\n→ I don\'t know where he lives.\n\nYes/No 疑問文は if / whether\nIs he coming?\n→ I wonder if he is coming.',
    ],
    quiz: [
      { q: 'Do you know where ___?', choices: ['she lives', 'does she live', 'lives she', 'she does live'], answer: 0, explain: '間接疑問は 主語+動詞 の語順' },
      { q: "I'm not sure ___ he'll come.", choices: ['if', 'that', 'what', 'which'], answer: 0, explain: 'Yes/No の内容 → if' },
      { q: 'Tell me what ___.', choices: ['you want', 'do you want', 'want you', 'you do want'], answer: 0, explain: '疑問詞 + 主語 + 動詞' },
      { q: 'Could you tell me ___ the station is?', choices: ['where', 'where is', 'is where', 'what'], answer: 0, explain: '疑問詞 + 主語 + 動詞' },
      { q: 'I wonder ___ it will rain.', choices: ['whether', 'what', 'that', 'which'], answer: 0, explain: 'Yes/No の内容 → whether / if' },
    ],
  },
  {
    id: 'g13',
    title: '未来表現 will / be going to',
    pages: [
      'will: その場で決めたこと・予測\nI\'ll get it.\n（電話に）私が出ます\nIt will be sunny tomorrow.\n明日は晴れるだろう',
      'be going to: すでに決めていた予定\nI\'m going to visit Kyoto.\n京都に行くつもりだ\n\n根拠のある予測にも使う\nLook at the clouds.\nIt\'s going to rain. 雨が降りそう',
      '現在進行形: 手配済みの確定した予定\nI\'m meeting Ken at six.\n6時にケンと会う（約束済み）\n\n決まった予定を will で言うと\n「今決めた」ように聞こえる',
    ],
    quiz: [
      { q: "The phone's ringing. I ___ get it.", choices: ["'ll", "'m going", 'am', 'was'], answer: 0, explain: 'その場で決めたことは will' },
      { q: 'Look at those clouds! It ___ rain.', choices: ['is going to', 'is raining to', 'will to', 'goes to'], answer: 0, explain: '根拠のある予測は be going to' },
      { q: 'I ___ Ken tonight. We made plans.', choices: ['am meeting', 'met', 'meeting', 'have met'], answer: 0, explain: '約束済みの予定は現在進行形' },
      { q: "I'm ___ visit my grandma this weekend.", choices: ['going to', 'will', 'go to', 'going'], answer: 0, explain: '前から決めていた予定 → be going to' },
      { q: 'I think he ___ like this gift.', choices: ['will', 'is going', 'is', 'going to'], answer: 0, explain: '意見・予想の I think ... will' },
    ],
  },
  {
    id: 'g14',
    title: '時制の一致',
    pages: [
      '主節が過去なら、中の動詞も過去に\nI think he is busy.\n→ I thought he was busy.\n彼は忙しいと思った\n\n日本語は「忙しい」のままなので注意',
      '助動詞も過去形にずらす\nwill → would / can → could\n\nShe said she would come.\n彼女は来ると言った\nHe said he could swim.\n彼は泳げると言った',
      '例外: 今も変わらない事実\nHe said the earth is round.\n地球は丸いと彼は言った\n\n今も本当なら現在形のままでもOK\nShe said she lives in Osaka.\n大阪に住んでいると言っていた',
    ],
    quiz: [
      { q: 'I thought you ___ at home.', choices: ['were', 'are being', 'will be', 'be'], answer: 0, explain: 'thought に合わせて過去形' },
      { q: 'She said she ___ help me.', choices: ['would', 'will be', 'can to', 'is'], answer: 0, explain: 'will は would にずらす' },
      { q: 'He told me he ___ tired.', choices: ['was', 'is being', 'were', 'be'], answer: 0, explain: 'told に合わせて was' },
      { q: 'She said she ___ busy.', choices: ['was', 'is being', 'be', 'were'], answer: 0, explain: 'said に合わせて was' },
      { q: 'I knew he ___ lying.', choices: ['was', 'is', 'has', 'be'], answer: 0, explain: 'knew に合わせて was' },
    ],
  },
  {
    id: 'g15',
    title: '分詞で名詞を説明する',
    pages: [
      '現在分詞(-ing): 〜している\n過去分詞(-ed): 〜された\n\na sleeping baby\n眠っている赤ちゃん\na broken window\n割れた窓',
      '2語以上なら名詞の後ろに置く\nthe man standing there\nあそこに立っている男性\n\na car made in Japan\n日本製の車',
      '迷ったら「する」か「される」か\nboiling water 沸騰しているお湯\na boiled egg ゆで卵(ゆでられた卵)\n\nthe language spoken in Brazil\nブラジルで話されている言語',
    ],
    quiz: [
      { q: 'Who is the girl ___ by the door?', choices: ['standing', 'stood', 'stands', 'to stand'], answer: 0, explain: '「立っている」→ 現在分詞' },
      { q: 'I bought a ___ car. (中古車)', choices: ['used', 'using', 'use', 'uses'], answer: 0, explain: '「使われた」→ 過去分詞' },
      { q: 'This is a photo ___ in Kyoto.', choices: ['taken', 'taking', 'took', 'takes'], answer: 0, explain: '写真は「撮られた」→ taken' },
      { q: 'Look at the ___ baby.', choices: ['sleeping', 'slept', 'sleeps', 'sleep'], answer: 0, explain: '「眠っている」→ 現在分詞' },
      { q: 'English is a language ___ all over the world.', choices: ['spoken', 'speaking', 'spoke', 'speaks'], answer: 0, explain: '言語は「話される」→ 過去分詞' },
    ],
  },
  {
    id: 'g16',
    title: '分詞構文',
    pages: [
      '接続詞と主語を省いて -ing で始める\n主に書き言葉で使う\n\nWhen I walked home, I met Ken.\n→ Walking home, I met Ken.\n歩いて帰る途中でケンに会った',
      '受け身なら過去分詞で始める\nSeen from space, the earth is blue.\n宇宙から見ると地球は青い\n\n否定は not を前に置く\nNot knowing what to say, I smiled.\n何と言えばいいか分からず笑った',
      '決まり文句として覚える\nGenerally speaking 一般的に言えば\nJudging from ... 〜から判断すると\nConsidering ... 〜を考えると\n\n分詞の主語は主節の主語と同じ',
    ],
    quiz: [
      { q: '___ tired, I went to bed early.', choices: ['Feeling', 'Felt', 'To feel', 'Feel'], answer: 0, explain: '私が「感じて」→ -ing' },
      { q: '___ in easy English, the book sells well.', choices: ['Written', 'Writing', 'Wrote', 'Write'], answer: 0, explain: '本は「書かれた」→ 過去分詞' },
      { q: '___ what to do, she asked me.', choices: ['Not knowing', 'Knowing not', "Don't know", 'Not known'], answer: 0, explain: '否定は not を分詞の前に' },
      { q: '___ down the street, I met Ken.', choices: ['Walking', 'Walked', 'Walk', 'To walking'], answer: 0, explain: '私が「歩いていて」→ -ing' },
      { q: '___ from here, the tower looks small.', choices: ['Seen', 'Seeing', 'Saw', 'See'], answer: 0, explain: 'タワーは「見られる」→ 過去分詞' },
    ],
  },
  {
    id: 'g17',
    title: '感情の -ing と -ed',
    pages: [
      '-ing: 感情を「与える」側\n-ed: 感情を「受ける」側（人）\n\nThe movie was boring.\n映画は退屈だった\nI was bored.\n私は退屈した',
      '× I\'m boring.（私は退屈な人だ）\n○ I\'m bored. 退屈だ\n\n同じ仲間\ninteresting / interested\nexciting / excited\nsurprising / surprised',
      'tired / tiring も同じ\nThe work was tiring.\n疲れる仕事だった\nI\'m tired. 疲れた\n\nconfusing 分かりにくい\nconfused 混乱している',
    ],
    quiz: [
      { q: 'The news was really ___.', choices: ['surprising', 'surprised', 'surprise', 'surprises'], answer: 0, explain: 'ニュースは驚きを与える側' },
      { q: 'I was so ___ about the trip.', choices: ['excited', 'exciting', 'excite', 'excites'], answer: 0, explain: '人がワクワクする → -ed' },
      { q: "This map is ___. I'm lost.", choices: ['confusing', 'confused', 'confuse', 'confusion'], answer: 0, explain: '地図が混乱させる → -ing' },
      { q: 'The movie was ___. I fell asleep.', choices: ['boring', 'bored', 'bore', 'bores'], answer: 0, explain: '映画が退屈させる → -ing' },
      { q: "I'm ___. What should I do?", choices: ['confused', 'confusing', 'confuse', 'confuses'], answer: 0, explain: '人が混乱している → -ed' },
    ],
  },
  {
    id: 'g18',
    title: '自動詞と他動詞',
    pages: [
      '他動詞は目的語を直接とる\n前置詞を入れないのがポイント\n\n× discuss about the plan\n○ discuss the plan\n× enter into the room\n○ enter the room',
      '前置詞がいらない動詞の仲間\nmarry her (× marry with)\nreach Tokyo (× reach to)\ncontact me (× contact to)\nattend the meeting (× attend to)\nresemble him (× resemble to)',
      '逆に前置詞が必要な自動詞\nlisten to music\nwait for the bus\ngraduate from college\napologize to him\narrive at the station',
      'lie と lay は形がまぎらわしい\nlie(自) 横になる: lie-lay-lain\nlay(他) 〜を置く: lay-laid-laid\n\nI lay down on the bed.\nベッドに横になった(lie の過去)',
    ],
    quiz: [
      { q: "Let's ___ the problem.", choices: ['discuss', 'discuss about', 'discuss on', 'discuss with'], answer: 0, explain: 'discuss は前置詞なし' },
      { q: 'She ___ him last year.', choices: ['married', 'married with', 'married to', 'marry with'], answer: 0, explain: 'marry 人 で「〜と結婚する」' },
      { q: 'I was tired, so I ___ down.', choices: ['lay', 'laid', 'lied', 'layed'], answer: 0, explain: 'lie(横になる)の過去は lay' },
      { q: 'We ___ at the hotel at 9.', choices: ['arrived', 'arrived to', 'reached at', 'got'], answer: 0, explain: 'arrive at（自動詞）/ reach 場所（他動詞）' },
      { q: 'Please ___ the room.', choices: ['enter', 'enter into', 'enter to', 'enter in'], answer: 0, explain: '部屋に入る enter は前置詞なし' },
    ],
  },
  {
    id: 'g19',
    title: '付加疑問文',
    pages: [
      '「〜ですよね？」と確認する\n肯定文には否定、否定文には肯定\n\nIt\'s cold, isn\'t it?\n寒いですよね\nYou don\'t eat meat, do you?\n肉は食べないですよね',
      '前の動詞に合わせて形を変える\nShe likes tea, doesn\'t she?\nYou went there, didn\'t you?\nHe can swim, can\'t he?\nI\'m right, aren\'t I?\n（I am のときは aren\'t I）',
      '命令文・Let\'s の場合\nOpen the door, will you?\nドアを開けてくれる？\nLet\'s go, shall we?\n行きましょうか\n\n下げ調子=確認 / 上げ調子=質問',
    ],
    quiz: [
      { q: "You're tired, ___?", choices: ["aren't you", "don't you", 'are you', "isn't it"], answer: 0, explain: "be動詞の肯定 → aren't you" },
      { q: 'He went home, ___?', choices: ["didn't he", "doesn't he", "wasn't he", 'did he'], answer: 0, explain: "過去の一般動詞 → didn't" },
      { q: "Let's have lunch, ___?", choices: ['shall we', "don't we", 'will we', "let's we"], answer: 0, explain: "Let's には shall we" },
      { q: "She can't swim, ___?", choices: ['can she', "can't she", 'does she', "doesn't she"], answer: 0, explain: '否定文には肯定の付加疑問' },
      { q: "It's a nice day, ___?", choices: ["isn't it", "doesn't it", 'is it', "isn't this"], answer: 0, explain: "is の肯定 → isn't it" },
    ],
  },
  {
    id: 'g20',
    title: '否定疑問文への答え方',
    pages: [
      '英語は「答えの内容が肯定か否定か」\nだけで Yes / No を決める\n\nDon\'t you like coffee?\nコーヒー好きじゃないの？\nNo, I don\'t. うん、好きじゃない\nYes, I do. いや、好きだよ',
      '日本語の「はい/いいえ」と逆になる\n\nAren\'t you tired?\n疲れてない？\n疲れていない → No, I\'m not.\n疲れている → Yes, I am.',
      '付加疑問でも同じ\nYou didn\'t go, did you?\n行かなかったよね？\n行かなかった → No, I didn\'t.\n\nYes/No の後ろの文を先に考え、\nそれに合わせて Yes/No を選ぶ',
    ],
    quiz: [
      { q: "Don't you eat fish?（食べない場合）", choices: ["No, I don't.", "Yes, I don't.", 'Yes, I do.', 'No, I do.'], answer: 0, explain: '食べない → No, I don\'t.' },
      { q: "Aren't you hungry?（空いている場合）", choices: ['Yes, I am.', "No, I'm not.", "Yes, I'm not.", 'No, I am.'], answer: 0, explain: '空いている → Yes, I am.' },
      { q: "You didn't call me, did you?\n（電話した場合）", choices: ['Yes, I did.', "No, I didn't.", "Yes, I didn't.", 'No, I did.'], answer: 0, explain: '電話した → Yes, I did.' },
      { q: "Didn't you go?（行った場合）", choices: ['Yes, I did.', "No, I didn't.", "Yes, I didn't.", 'No, I did.'], answer: 0, explain: '行った → Yes, I did.' },
      { q: "Isn't he coming?（来ない場合）", choices: ["No, he isn't.", 'Yes, he is.', "Yes, he isn't.", 'No, he is.'], answer: 0, explain: "来ない → No, he isn't." },
    ],
  },
  {
    id: 'g21',
    title: '関係副詞 where / when',
    pages: [
      '場所を説明する → where\nThis is the town where I grew up.\nここは私が育った町だ\n\n= the town in which I grew up\n（where = 前置詞 + which）',
      '時を説明する → when\nI remember the day when we met.\n出会った日を覚えている\n\n場所でも目的語なら which\nThis is the town which I visited.\n（visit the town なので which）',
      'why と how\nThat\'s the reason why I quit.\nそれが辞めた理由だ\nThis is how I learned English.\nこうやって英語を覚えた\n\n× the way how（片方だけ使う）',
    ],
    quiz: [
      { q: 'This is the café ___ we first met.', choices: ['where', 'which', 'what', 'who'], answer: 0, explain: '場所 + 完全な文 → where' },
      { q: 'I visited the museum ___ you told me about.', choices: ['which', 'where', 'when', 'what'], answer: 0, explain: 'about の目的語 → which' },
      { q: 'Summer is the season ___ I feel best.', choices: ['when', 'where', 'which', 'what'], answer: 0, explain: '時を説明する → when' },
      { q: 'I remember the day ___ we met.', choices: ['when', 'where', 'which', 'what'], answer: 0, explain: '日を説明する → when' },
      { q: "That's the reason ___ I quit.", choices: ['why', 'where', 'what', 'which'], answer: 0, explain: '理由を説明する → why' },
    ],
  },
  {
    id: 'g22',
    title: 'say / tell / speak / talk',
    pages: [
      'say: 言葉・内容そのものを言う\nHe said, "I\'m sorry."\nShe said (that) she was busy.\n\ntell: 人に伝える（人が必要）\nTell me the truth.\n× Say me the truth.',
      'speak: 言語を話す・一方的に話す\nI speak English.\nMay I speak to Ken?（電話で）\n\ntalk: 相手とのおしゃべり\nLet\'s talk about it.\nそれについて話そう',
      'よく使う組み合わせ\ntell a lie / tell a story\nsay hello / say goodbye\nspeak Japanese\ntalk to 人 / talk with 人\n\nsay は人を直接目的語にとらない',
    ],
    quiz: [
      { q: 'Can you ___ me the way?', choices: ['tell', 'say', 'speak', 'talk'], answer: 0, explain: '人に伝える → tell 人' },
      { q: 'How do you ___ this word?', choices: ['say', 'tell', 'talk', 'speak to'], answer: 0, explain: '言葉そのものを言う → say' },
      { q: 'Do you ___ French?', choices: ['speak', 'talk', 'say', 'tell'], answer: 0, explain: '言語を話す → speak' },
      { q: 'Can I ___ to you for a minute?', choices: ['talk', 'say', 'tell', 'speak about'], answer: 0, explain: 'talk to 人（話をする）' },
      { q: 'He ___ me a funny story.', choices: ['told', 'said', 'spoke', 'talked'], answer: 0, explain: 'tell 人 物（話を聞かせる）' },
    ],
  },
  {
    id: 'g23',
    title: '控えめで丁寧な頼み方',
    pages: [
      '過去形・進行形で遠回しにすると丁寧\nI was wondering if you could help me.\n手伝っていただけないかと思いまして\n\nif の後ろは could / would が自然',
      '他にも使える控えめな言い方\nDo you think you could ...?\n〜してもらえそうですか\nWould it be OK if I ...?\n〜してもよろしいですか\nI\'d appreciate it if you could ...\n〜していただけると助かります',
      'Would you mind の答え方\nWould you mind opening the window?\n窓を開けるのは嫌ですか？\n\n引き受ける → Not at all.\n「嫌じゃない」ので否定で答える\n× Yes. だと「嫌です」になる',
    ],
    quiz: [
      { q: 'I was wondering ___ you could help.', choices: ['if', 'that', 'what', 'when'], answer: 0, explain: 'wonder if で「〜かなと思う」' },
      { q: 'Would you mind ___ the door?', choices: ['closing', 'to close', 'close', 'closed'], answer: 0, explain: 'mind の後ろは -ing' },
      { q: 'Would you mind waiting?\n快く引き受ける返事は？', choices: ['Not at all.', 'Yes, I do.', 'Yes, I would.', 'Yes, I mind.'], answer: 0, explain: '「嫌じゃない」→ Not at all.' },
      { q: '___ you mind if I sat here?', choices: ['Would', 'Will', 'Do', 'Are'], answer: 0, explain: 'Would you mind if + 過去形 がより丁寧' },
      { q: 'Could you possibly ___ me a hand?', choices: ['give', 'giving', 'to give', 'gave'], answer: 0, explain: 'Could you の後ろは動詞の原形' },
    ],
  },
  {
    id: 'g24',
    title: '句動詞の語順',
    pages: [
      '動詞 + 副詞（off, up, on など）\n名詞はどちらの位置でもOK\nturn off the light\nturn the light off\n\n代名詞(it/them)は必ず間に入る\n× turn off it  ○ turn it off',
      'よく使う句動詞\npick it up 拾う\nput it on 着る\ntake it off 脱ぐ\ngive it up 諦める\ncall him back 折り返し電話する',
      '動詞 + 前置詞は分けられない\nlook for it 探す (× look it for)\nlook after them 世話をする\nget on the bus → get on it\n\n前置詞の後ろに名詞・代名詞を置く',
    ],
    quiz: [
      { q: "It's dark. Please ___.", choices: ['turn it on', 'turn on it', 'it turn on', 'on turn it'], answer: 0, explain: '代名詞は動詞と副詞の間' },
      { q: "I lost my key. I'm ___.", choices: ['looking for it', 'looking it for', 'looking it', 'for looking it'], answer: 0, explain: 'look for は分けられない' },
      { q: 'Your coat is on the floor. ___!', choices: ['Pick it up', 'Pick up it', 'Up pick it', 'It pick up'], answer: 0, explain: 'pick 代名詞 up の語順' },
      { q: 'That shirt looks nice. ___.', choices: ['Try it on', 'Try on it', 'It try on', 'On try it'], answer: 0, explain: 'try 代名詞 on の語順' },
      { q: 'I ran ___ an old friend.', choices: ['into', 'it into', 'on', 'to'], answer: 0, explain: 'run into（偶然会う）は分けられない' },
    ],
  },
]
