
import { MockTweetRepository } from './tweets-repository.provider.spec';
import { Tweet } from './tweet.entity';
import { TweetsService } from './tweets.service';

export const mockTweet: Tweet = new Tweet();
mockTweet.userUuid = '00000000-0000-0000-0000-000000000000';
mockTweet.content = 'Hello World';

export const mockTweet2: Tweet = new Tweet();
mockTweet2.userUuid = '00000000-0000-0000-0000-000000000001';
mockTweet2.content = 'Awesome TypeORM';

describe('TweetsService', () => {
  let tweetRepo: MockTweetRepository;
  let tweetsService: TweetsService;
  let newTweet: Tweet;
  let newTweet2: Tweet;

  beforeAll(async () => {
    tweetRepo = new MockTweetRepository();
    tweetsService = new TweetsService(await tweetRepo.connect());

    expect(tweetsService).toBeInstanceOf(TweetsService);
  });

  it('should be able to create new tweet', async () => {
    newTweet = await tweetsService.create(mockTweet);
    newTweet2 = await tweetsService.create(mockTweet2);

    expect(newTweet).toHaveProperty('id');
    expect(newTweet).toHaveProperty('userUuid', '00000000-0000-0000-0000-000000000000');
    expect(newTweet).toHaveProperty('content', 'Hello World');
  });

  it('should be able to list all tweets', async () => {
    const [tweets, count] = await tweetsService.findTweets(mockTweet.userUuid, undefined);
    expect(count).toBe(1);
    expect(tweets).toContainEqual(newTweet);
  });

  it('should be able to list all tweets from a specific id', async () => {
    const [tweets, count] = await tweetsService.findTweets(mockTweet.userUuid, 500000);
    expect(count).toBe(1);
    expect(tweets).toContainEqual(newTweet);
  });

  it('should be able to list all tweets', async () => {
    const [tweets, count] = await tweetsService.findTweetsMultipleUsers([
      mockTweet.userUuid,
      mockTweet2.userUuid,
    ], undefined);
    expect(count).toBe(2);
    expect(tweets).toContainEqual(newTweet);
    expect(tweets).toContainEqual(newTweet2);
  });

  it('should be able to list all tweets from a specific id', async () => {
    const [tweets, count] = await tweetsService.findTweetsMultipleUsers([mockTweet2.userUuid], 500000);
    expect(count).toBe(1);
    expect(tweets).toContainEqual(newTweet2);
  });

  it('should be able to findTweet by id', async () => {
    const tweet = await tweetsService.findTweet(newTweet.id);

    expect(tweet).toEqual(newTweet);
  });

  afterAll(async () => {
    await tweetRepo.close();
  });
});
