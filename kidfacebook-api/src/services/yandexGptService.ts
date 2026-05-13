import axios from 'axios';
import { z } from 'zod';
import {
  YandexGptConfig,
  GeneratedStory,
  Gender,
  BookStyle,
  GeneratedStoryJsonSchema,
} from '../types';

interface StoryGenerationParams {
  childName: string;
  childAge: number;
  childGender: Gender;
  interests: string[];
  style: BookStyle;
  tone: string;
}

const COMPLETION_URL =
  'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

const YandexCompletionResponseSchema = z.object({
  result: z
    .object({
      alternatives: z
        .array(
          z.object({
            message: z.object({
              role: z.string().optional(),
              text: z.string(),
            }),
          }),
        )
        .min(1),
    })
    .optional(),
});

export class YandexGptService {
  private config: YandexGptConfig;

  constructor(config: YandexGptConfig) {
    this.config = config;
  }

  async generateStory(params: StoryGenerationParams): Promise<GeneratedStory> {
    const { childName, childAge, childGender, interests, tone, style } = params;

    const styleHint =
      style === 'fairy-tale'
        ? 'сказочная книга'
        : style === 'comic'
          ? 'комикс'
          : 'история в духе Pixar';

    const genderText = childGender === 'boy' ? 'мальчик' : 'девочка';
    const interestsText = interests.join(', ');
    const prompt = `Ты — опытный детский писатель с чувством юмора и ритма фразы. Напиши тёплую, «ожившую» сказку, которую приятно читать вслух.

Главный герой: ${childName}, ${genderText} ${childAge} лет.
Интересы ребёнка: ${interestsText}.
Общий тон и жанр: ${tone}.
Формат книги в приложении: ${styleHint}.

Объём и структура:
1. Ровно 10–12 элементов в массиве pages (номера pageNumber подряд с 1).
2. На каждой странице поле text: примерно 2–4 коротких предложения ИЛИ 1–2 предложения + 1–3 коротких реплики диалога в кавычках «». Не делай абзацы длиннее этого объёма — ребёнку ${childAge} лет должно быть комфортно слушать страницу за один заход.

Живость текста (обязательно соблюдай по возможности на всей книге):
3. Диалоги: хотя бы на 5–7 страницах пусть звучит прямая речь героя, зверей или волшебных персонажей (короткие фразы, по-разному, не одно и то же «Привет!»).
4. Эмоции и реакции: радость, удивление, смех, лёгкая тревога и облегчение — показывай через действия и слова («глаза расширились», «фыркнул от смеха», «затаила дыхание»), а не одним сухим сообщением «ему было страшно».
5. Язык под возраст ${childAge}: понятные слова, но не примитивный телеграф; допускаются яркие сравнения и 1–2 «вкусных» прилагательных на страницу, без перегруза эпитетами.
6. Избегай шаблона «Потом они пошли. Потом увидели. Потом сделали»: чередуй описание, диалог, шаг сюжета, юмористическую или тёплую деталь.
7. Обращение к герою по имени (${childName}) иногда в тексте и в репликах — чтобы история ощущалась личной.

Содержание:
8. История добрая, безопасная, с ясным добрым финалом; герой активен, не пассивная «кукла».
9. Включи мотивы из интересов ребёнка естественно в сюжет, не списком.
10. Поле moral — одна двух-трёх предложений мысль без нотации; можно мягко и с теплом.

Технические поля:
11. title: короткое звучное название для обложки (ориентир до ~40 символов).
12. coverImagePrompt (английский): только обложка, атмосфера всей сказки, без букв на картинке; не дублируй сцену pages[0].imagePrompt.

Ответь ОДНИМ JSON-объектом. Структура:
{
  "title": "Короткое название",
  "coverImagePrompt": "English description for book cover art only, no text in image",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Текст страницы на русском",
      "imagePrompt": "English scene description for image generation, no text in image"
    }
  ],
  "moral": "Мораль истории"
}
Важно: imagePrompt и coverImagePrompt — на английском; только описание сцены для иллюстрации.`;

    console.log('🤖 YandexGPT: Generating story for', childName);

    const apiKey = this.config.apiKey?.trim();
    const folderId = this.config.folderId?.trim();

    if (!apiKey || !folderId) {
      console.warn(
        'YandexGPT: не заданы YANDEX_GPT_API_KEY или YANDEX_GPT_FOLDER_ID — используется мок.',
      );
      return this.getMockStory(childName, childGender, interests);
    }

    const rawText = await this.callYandexCompletion(prompt, apiKey, folderId);
    return this.parseStoryFromModelText(rawText);
  }

  private modelUri(folderId: string): string {
    const override = process.env.YANDEX_GPT_MODEL_URI?.trim();
    if (override) {
      return override;
    }
    const variant = process.env.YANDEX_GPT_MODEL?.trim() || 'yandexgpt/latest';
    return `gpt://${folderId}/${variant}`;
  }

  private async callYandexCompletion(
    userPrompt: string,
    apiKey: string,
    folderId: string,
  ): Promise<string> {
    const modelUri = this.modelUri(folderId);

    try {
      const response = await axios.post(
        COMPLETION_URL,
        {
          modelUri,
          completionOptions: {
            stream: false,
            temperature: 0.78,
            maxTokens: 8000,
          },
          messages: [
            {
              role: 'system',
              text: 'Ты возвращаешь ровно один JSON-объект в UTF-8, без текста до или после него и без Markdown. Внутри каждого поля text — живая детская проза: допускаются диалоги в кавычках «», звукоподражания умеренно, эмоции; не сухой пересказ событий.',
            },
            { role: 'user', text: userPrompt },
          ],
        },
        {
          headers: {
            Authorization: `Api-Key ${apiKey}`,
            'x-folder-id': folderId,
            'Content-Type': 'application/json',
          },
          timeout: 180000,
          validateStatus: () => true,
        },
      );

      const { data, status } = response;
      if (status >= 400) {
        throw new Error(
          `YandexGPT HTTP ${status}: ${typeof data === 'object' ? JSON.stringify(data) : String(data)}`,
        );
      }

      if (typeof data === 'object' && data !== null && 'error' in data) {
        throw new Error(`YandexGPT: ${JSON.stringify((data as { error: unknown }).error)}`);
      }

      const parsed = YandexCompletionResponseSchema.safeParse(data);
      if (!parsed.success || !parsed.data.result?.alternatives[0]?.message?.text) {
        throw new Error(
          `YandexGPT: неожиданный ответ API: ${JSON.stringify(data).slice(0, 500)}`,
        );
      }

      return parsed.data.result.alternatives[0].message.text;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const ax = err;
        const body = ax.response?.data;
        const detail =
          body !== undefined
            ? typeof body === 'object'
              ? JSON.stringify(body)
              : String(body)
            : ax.message;
        throw new Error(`YandexGPT запрос не удался (${ax.response?.status ?? 'net'}): ${detail}`);
      }
      throw err;
    }
  }

  private extractJsonObject(text: string): string {
    let t = text.trim();
    const fenced = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im.exec(t);
    if (fenced) {
      t = fenced[1].trim();
    }
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return t.slice(start, end + 1);
    }
    return t;
  }

  private parseStoryFromModelText(text: string): GeneratedStory {
    const jsonStr = this.extractJsonObject(text);
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(jsonStr);
    } catch {
      throw new Error(
        `YandexGPT: ответ не является JSON. Фрагмент: ${jsonStr.slice(0, 280)}…`,
      );
    }

    const storyResult = GeneratedStoryJsonSchema.safeParse(parsedJson);
    if (!storyResult.success) {
      throw new Error(
        `YandexGPT: JSON не соответствует схеме: ${storyResult.error.message}`,
      );
    }

    const { title, pages, moral } = storyResult.data;
    const sorted = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
    return { title, pages: sorted, moral };
  }

  /** Запасной сценарий без ключей (локальная разработка). */
  private getMockStory(name: string, gender: Gender, interests: string[]): GeneratedStory {
    const heroWord = gender === 'boy' ? 'мальчик' : 'девочка';

    return {
      title: `${name} и лес чудес`,
      coverImagePrompt: `Decorative children's book cover illustration, magical golden forest gate and soft sunlight, whimsical storybook frame feel, inviting adventure mood, rich colors, no text, no letters, no typography`,
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
}
