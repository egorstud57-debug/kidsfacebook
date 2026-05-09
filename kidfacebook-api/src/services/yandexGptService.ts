import { YandexGptConfig, GeneratedStory, BookStyle, Gender } from '../types';

interface StoryGenerationParams {
  childName: string;
  childAge: number;
  childGender: Gender;
  interests: string[];
  style: BookStyle;
  tone: string;
}

export class YandexGptService {
  private config: YandexGptConfig;

  constructor(config: YandexGptConfig) {
    this.config = config;
  }

  async generateStory(params: StoryGenerationParams): Promise<GeneratedStory> {
    const { childName, childAge, childGender, interests, tone } = params;

    const genderText = childGender === 'boy' ? 'мальчик' : 'девочка';
    const interestsText = interests.join(', ');
    const prompt = `
Ты - талантливый детский писатель. Напиши добрую сказку для ребёнка.
Главный герой: ${childName}, ${genderText} ${childAge} лет.
Интересы ребёнка: ${interestsText}.
Стиль: ${tone}.
Требования:
1. Сказка должна состоять из 10-12 страниц
2. Каждая страница - 2-3 предложения (для детского внимания)
3. История должна быть доброй и поучительной
4. Главный герой должен быть похож на ребёнка по характеру
5. Включи элементы, связанные с интересами ребёнка
6. В конце должна быть мораль или добрый вывод
Формат ответа (строго JSON):
{
  "title": "Название сказки",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Текст страницы",
      "imagePrompt": "Описание иллюстрации на английском для генерации картинки"
    }
  ],
  "moral": "Мораль истории"
}
Важно: imagePrompt должен быть на английском языке и описывать сцену для иллюстрации.
`;

    console.log('🤖 YandexGPT: Generating story for', childName);
    await this.simulateDelay(2000);
    return this.getMockStory(childName, childGender, interests, prompt);
  }

  // TODO: подключить реальный API
  private async callYandexApi(_prompt: string): Promise<string> {
    return '';
  }

  private getMockStory(
    name: string,
    gender: Gender,
    interests: string[],
    _prompt: string,
  ): GeneratedStory {
    const heroWord = gender === 'boy' ? 'мальчик' : 'девочка';

    return {
      title: `${name} и Волшебный Лес`,
      pages: [
        {
          pageNumber: 1,
          text: `Жил-был ${heroWord} по имени ${name}. ${name} очень любил${gender === 'girl' ? 'а' : ''} ${interests[0] || 'приключения'}.`,
          imagePrompt: `A cute ${gender === 'boy' ? 'boy' : 'girl'} child named ${name} in a cozy storybook scene, warm light`,
        },
        {
          pageNumber: 2,
          text: `Однажды утром ${name} нашёл${gender === 'girl' ? 'а' : ''} в саду светящуюся тропинку в лес.`,
          imagePrompt: `A magical glowing path in an enchanted forest, soft dreamy storybook art`,
        },
        {
          pageNumber: 3,
          text: `${name} смело пошёл${gender === 'girl' ? 'а' : ''} вперёд, чтобы узнать, куда ведёт тропа.`,
          imagePrompt: `A brave child taking first steps into a magical forest, cinematic children's illustration`,
        },
        {
          pageNumber: 4,
          text: `В лесу ${name} встретил${gender === 'girl' ? 'а' : ''} доброго кролика-проводника.`,
          imagePrompt: `A friendly rabbit guide and child in magical forest, colorful whimsical style`,
        },
        {
          pageNumber: 5,
          text: `По пути они помогли белочке найти потерянные орехи.`,
          imagePrompt: `Child helping a cute squirrel find acorns, bright warm storybook scene`,
        },
        {
          pageNumber: 6,
          text: `Потом друзья построили мостик для семьи ежей через ручей.`,
          imagePrompt: `Child building a small bridge for hedgehogs over stream, gentle children's illustration`,
        },
        {
          pageNumber: 7,
          text: `Наконец они дошли до Великого Дерева с тысячами огоньков.`,
          imagePrompt: `A giant glowing magical tree with tiny lights, child in awe`,
        },
        {
          pageNumber: 8,
          text: `Дерево похвалило ${name} за доброту и смелость.`,
          imagePrompt: `Magical tree speaking kindly to child, warm fantasy atmosphere`,
        },
        {
          pageNumber: 9,
          text: `${name} пожелал${gender === 'girl' ? 'а' : ''}, чтобы все лесные друзья были счастливы.`,
          imagePrompt: `Child making a kind wish surrounded by forest friends, magical sparkles`,
        },
        {
          pageNumber: 10,
          text: `Лес засиял ярче, а приключение стало началом большой дружбы.`,
          imagePrompt: `Happy magical forest celebration with child and animal friends`,
        },
      ],
      moral: 'Доброта и помощь другим делают мир волшебным!',
    };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
